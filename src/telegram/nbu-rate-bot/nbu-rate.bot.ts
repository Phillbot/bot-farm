import path from 'path';

import { Bot, Composer, Context, GrammyError, HttpError, SessionFlavor, session } from 'grammy';
import { inject, injectable } from 'inversify';
import { EmojiFlavor, emojiParser } from '@grammyjs/emoji';
import { I18n, I18nFlavor } from '@grammyjs/i18n';

import { NBURateBotUser } from '@database/nbu-rate-bot.db';

import {
  NBURateBotRateAllCommand,
  NBURateBotRateMainCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from './commands';
import { COMMANDS, NBURateBotUtils, NBURateType, defaultLang, supportLangs } from './nbu-rate.utils';

interface SessionData {
  __language_code?: string;
}

export type NBURateBotContext = EmojiFlavor<
  Pick<NBURateBotUser, 'dataValues'> &
    Context &
    SessionFlavor<SessionData> &
    I18nFlavor & { nbuExchangeData?: NBURateType[] }
>;

@injectable()
export class NBURateBot {
  private readonly _bot = new Bot<NBURateBotContext>(process.env.NBU_RATE_BOT_TOKEN!);
  private readonly _composer = new Composer<NBURateBotContext>();
  private readonly _i18n = new I18n<NBURateBotContext>({
    defaultLocale: defaultLang,
    useSession: true,
    directory: path.join(__dirname, '../common/locales'),
  });

  // Add command here for add new command functionality
  private readonly _commandsMethodsConfig = new Map([
    [COMMANDS.START, { instance: this._nbuRateBotStartCommand }],
    [COMMANDS.RATE, { instance: this._nbuRateBotRateAllCommand }],
    [COMMANDS.RATE_MAIN, { instance: this._nbuRateBotRateMainCommand }],
    [COMMANDS.SUBSCRIBE, { instance: this._nbuRateBotSubscribeCommand }],
    [COMMANDS.UNSUBSCRIBE, { instance: this._nbuRateBotUnsubscribeCommand }],
  ]);

  // Add command here for add new command in bot menu
  private readonly _commandsMenuConfig = new Map([
    [COMMANDS.START, 'nbu-exchange-bot-start-command-descriptor'],
    [COMMANDS.RATE, 'nbu-exchange-bot-rate-command-descriptor'],
    [COMMANDS.RATE_MAIN, 'nbu-exchange-bot-rate-main-command-descriptor'],
    [COMMANDS.SUBSCRIBE, 'nbu-exchange-bot-subscribe-command-descriptor'],
    [COMMANDS.UNSUBSCRIBE, 'nbu-exchange-bot-unsubscribe-command-descriptor'],
  ]);

  // TODO: additional commands by user role

  constructor(
    @inject(NBURateBotStartCommand) private readonly _nbuRateBotStartCommand: NBURateBotStartCommand,
    @inject(NBURateBotRateAllCommand) private readonly _nbuRateBotRateAllCommand: NBURateBotRateAllCommand,
    @inject(NBURateBotRateMainCommand) private readonly _nbuRateBotRateMainCommand: NBURateBotRateMainCommand,
    @inject(NBURateBotSubscribeCommand) private readonly _nbuRateBotSubscribeCommand: NBURateBotSubscribeCommand,
    @inject(NBURateBotUnsubscribeCommand) private readonly _nbuRateBotUnsubscribeCommand: NBURateBotUnsubscribeCommand,
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
  ) {}

  private commands() {
    for (const [command, { instance }] of [...this._commandsMethodsConfig.entries()]) {
      this._bot.command(command, (ctx) => instance.withCtx(ctx));
    }
  }

  private async init() {
    await supportLangs.forEach((lang) => {
      this._bot.api.setMyCommands(
        [...this._commandsMenuConfig.entries()].map(([command, translateKey]) => ({
          command,
          description: this._i18n.t(lang, translateKey),
        })),
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

    this._bot.use(this._composer);

    this._composer.use(this._i18n);
    this._composer.use(this._nbuRateBotUtils.tryUpdateUserLang);

    // example how add middleware with condition
    this._composer.filter(
      (ctx) => ctx.hasCommand([COMMANDS.RATE, COMMANDS.RATE_MAIN]),
      // middleware fn here
      async (_, next) => await next(),
    );

    // bot start
    this.init();
    this.commands();
    this.errorHandler();
  }
}
