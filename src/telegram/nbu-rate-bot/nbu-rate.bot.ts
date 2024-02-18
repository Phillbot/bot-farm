import path from 'path';

import { Bot, Context, SessionFlavor, session } from 'grammy';
import { inject, injectable } from 'inversify';

import { EmojiFlavor, emojiParser } from '@grammyjs/emoji';
import { I18n, I18nFlavor } from '@grammyjs/i18n';
import { NBURateBotUser } from '@database/nbu-rate-bot.db';

import {
  NBURateBotRateCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from './commands';
import { COMMANDS } from './types';
import { DefaultLang, NBURateBotUtils, supportLangs } from './nbu-rate.utils';

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

  constructor(
    @inject(NBURateBotStartCommand)
    private readonly _nbuRateBotStartCommand: NBURateBotStartCommand,
    @inject(NBURateBotRateCommand)
    private _nbuRateBotRateCommand: NBURateBotRateCommand,
    @inject(NBURateBotSubscribeCommand)
    private _nbuRateBotSubscribeCommand: NBURateBotSubscribeCommand,
    @inject(NBURateBotUnsubscribeCommand)
    private _nbuRateBotUnsubscribeCommand: NBURateBotUnsubscribeCommand,
    @inject(NBURateBotUtils)
    private _nbuRateBotUtils: NBURateBotUtils,
  ) {
    this._bot.use(emojiParser());

    this._bot.use(
      session({
        initial: () => {
          return {};
        },
      }),
    );

    this._bot.use(this._i18n);
    this._bot.use(this._nbuRateBotUtils.updateUserLang);

    this.init();

    this.commands();
    // errors
    // eslint-disable-next-line
    this._bot.catch((e) => console.log(e));
  }

  private commands() {
    this._bot.command(COMMANDS.START, (ctx) =>
      this._nbuRateBotStartCommand.withCtx(ctx),
    );

    this._bot.command([COMMANDS.RATE, COMMANDS.RATE_MAIN], (ctx) =>
      this._nbuRateBotRateCommand.withCtx(ctx),
    );

    this._bot.command(COMMANDS.SUBSCRIBE, (ctx) =>
      this._nbuRateBotSubscribeCommand.withCtx(ctx),
    );

    this._bot.command(COMMANDS.UNSUBSCRIBE, (ctx) =>
      this._nbuRateBotUnsubscribeCommand.withCtx(ctx),
    );
  }

  private async init() {
    await supportLangs.forEach((lang) => {
      this._bot.api.setMyCommands(
        [
          {
            command: COMMANDS.START,
            description: this._i18n.t(
              lang,
              'nbu-exchange-bot-start-command-descriptor',
            ),
          },
          {
            command: COMMANDS.RATE,
            description: this._i18n.t(
              lang,
              'nbu-exchange-bot-rate-command-descriptor',
            ),
          },
          {
            command: COMMANDS.RATE_MAIN,
            description: this._i18n.t(
              lang,
              'nbu-exchange-bot-rate-main-command-descriptor',
            ),
          },
          {
            command: COMMANDS.SUBSCRIBE,
            description: this._i18n.t(
              lang,
              'nbu-exchange-bot-subscribe-command-descriptor',
            ),
          },
          {
            command: COMMANDS.UNSUBSCRIBE,
            description: this._i18n.t(
              lang,
              'nbu-exchange-bot-unsubscribe-command-descriptor',
            ),
          },
        ],
        { language_code: lang === DefaultLang ? undefined : lang },
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

  public get bot() {
    return this._bot;
  }

  public get i18n() {
    return this._i18n;
  }
}
