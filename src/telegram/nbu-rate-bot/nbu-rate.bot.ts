import path from 'path';

import {
  Bot,
  Context,
  GrammyError,
  HttpError,
  SessionFlavor,
  session,
} from 'grammy';
import { inject, injectable } from 'inversify';

import { EmojiFlavor, emojiParser } from '@grammyjs/emoji';
import { I18n, I18nFlavor } from '@grammyjs/i18n';
import { NBURateBotUser } from '@database/nbu-rate-bot.db';

import {
  NBURateBotRateCommand,
  NBURateBotRateMainCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from './commands';

import {
  COMMANDS,
  NBURateBotUtils,
  defaultLang,
  supportLangs,
} from './nbu-rate.utils';

interface SessionData {
  __language_code?: string;
}

export type NBURateBotContext = EmojiFlavor<
  Pick<NBURateBotUser, 'dataValues'> &
    Context &
    SessionFlavor<SessionData> &
    I18nFlavor
>;

@injectable()
export class NBURateBot {
  private readonly _bot = new Bot<NBURateBotContext>(
    process.env.NBU_RATE_BOT_TOKEN as string,
  );

  private readonly _i18n = new I18n<NBURateBotContext>({
    defaultLocale: 'uk',
    useSession: true,
    directory: path.join(__dirname, './locales'),
  });

  private readonly _commandsConfig = new Map([
    [
      COMMANDS.START,
      {
        instance: this._nbuRateBotStartCommand,
        translateKey: 'nbu-exchange-bot-start-command-descriptor',
      },
    ],
    [
      COMMANDS.RATE,
      {
        instance: this._nbuRateBotRateCommand,
        translateKey: 'nbu-exchange-bot-rate-command-descriptor',
      },
    ],
    [
      COMMANDS.RATE_MAIN,
      {
        instance: this._nbuRateBotRateMainCommand,
        translateKey: 'nbu-exchange-bot-rate-main-command-descriptor',
      },
    ],
    [
      COMMANDS.SUBSCRIBE,
      {
        instance: this._nbuRateBotSubscribeCommand,
        translateKey: 'nbu-exchange-bot-subscribe-command-descriptor',
      },
    ],
    [
      COMMANDS.UNSUBSCRIBE,
      {
        instance: this._nbuRateBotUnsubscribeCommand,
        translateKey: 'nbu-exchange-bot-unsubscribe-command-descriptor',
      },
    ],
  ]);

  constructor(
    @inject(NBURateBotStartCommand)
    private readonly _nbuRateBotStartCommand: NBURateBotStartCommand,
    @inject(NBURateBotRateCommand)
    private _nbuRateBotRateCommand: NBURateBotRateCommand,
    @inject(NBURateBotRateMainCommand)
    private _nbuRateBotRateMainCommand: NBURateBotRateMainCommand,
    @inject(NBURateBotSubscribeCommand)
    private _nbuRateBotSubscribeCommand: NBURateBotSubscribeCommand,
    @inject(NBURateBotUnsubscribeCommand)
    private _nbuRateBotUnsubscribeCommand: NBURateBotUnsubscribeCommand,
    @inject(NBURateBotUtils)
    private _nbuRateBotUtils: NBURateBotUtils,
  ) {}

  private commands() {
    for (const [command, { instance }] of this._commandsConfig.entries()) {
      this._bot.command(command, (ctx) => instance.withCtx(ctx));
    }
  }

  private async init() {
    //TODO: check user for set additional commands
    await supportLangs.forEach((lang) => {
      this._bot.api.setMyCommands(
        [...this._commandsConfig.entries()].map(
          ([command, { translateKey }]) => ({
            command,
            description: this._i18n.t(lang, translateKey),
          }),
        ),
        { language_code: lang === defaultLang ? undefined : lang },
      );
    });

    await this._bot.start({
      onStart: (bot) => {
        // eslint-disable-next-line
        console.table({ bot_name: NBURateBot.name, ...bot });
      },
      drop_pending_updates: true,
    });
  }

  private errorHandler() {
    // errors
    this._bot.catch((err) => {
      const ctx = err.ctx;
      // eslint-disable-next-line
      console.error(`Error while handling update ${ctx.update.update_id}:`);
      const e = err.error;
      if (e instanceof GrammyError) {
        // eslint-disable-next-line
        console.error('Error in request:', e.description);
      } else if (e instanceof HttpError) {
        // eslint-disable-next-line
        console.error('Could not contact Telegram:', e);
      } else {
        // eslint-disable-next-line
        console.error('Unknown error:', e);
      }
    });
  }

  public get bot() {
    return this._bot;
  }

  public get i18n() {
    return this._i18n;
  }

  public botStart() {
    // middlewares
    this._bot.use(emojiParser());
    this._bot.use(
      session({
        initial: () => {
          return {};
        },
      }),
    );
    this._bot.use(this._i18n);
    this._bot.use(this._nbuRateBotUtils.tryUpdateUserLang);

    // bot start
    this.init();
    this.commands();
    this.errorHandler();
  }
}
