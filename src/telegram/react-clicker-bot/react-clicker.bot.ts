import path from 'path';

import { Bot, Composer, Context, GrammyError, HttpError, SessionFlavor, session } from 'grammy';
import { inject, injectable } from 'inversify';
import { EmojiFlavor, emojiParser } from '@grammyjs/emoji';
import { I18n, I18nFlavor } from '@grammyjs/i18n';

import { ReactClickerBotPlayCommand, ReactClickerBotStartCommand } from './commands';
import { COMMANDS, defaultLang, supportLangs } from './react-clicker.utils';

interface SessionData {
  __language_code?: string;
}

export type ReactClickerBotContext = EmojiFlavor<Context & SessionFlavor<SessionData> & I18nFlavor>;

@injectable()
export class ReactClickerBot {
  private readonly _bot = new Bot<ReactClickerBotContext>(process.env.REACT_CLICKER_BOT_TOKEN!);
  private readonly _composer = new Composer<ReactClickerBotContext>();
  private readonly _i18n = new I18n<ReactClickerBotContext>({
    defaultLocale: defaultLang,
    useSession: true,
    directory: path.join(__dirname, '../common/locales'),
  });

  // Add command here for add new command functionality
  private readonly _commandsMethodsConfig = new Map([
    [COMMANDS.START, { instance: this._reactClickerBotStartCommand }],
    [COMMANDS.PLAY, { instance: this._reactClickerBotPlayCommand }],
  ]);

  // Add command here for add new command in bot menu
  private readonly _commandsMenuConfig = new Map([
    [COMMANDS.START, 'nbu-exchange-bot-start-command-descriptor'],
    [COMMANDS.PLAY, 'nbu-exchange-bot-start-command-descriptor'],
  ]);

  // TODO: additional commands by user role

  constructor(
    @inject(ReactClickerBotStartCommand) private readonly _reactClickerBotStartCommand: ReactClickerBotStartCommand,
    @inject(ReactClickerBotPlayCommand) private readonly _reactClickerBotPlayCommand: ReactClickerBotPlayCommand,
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
        console.table({ bot_name: ReactClickerBot.name, ...bot });
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

    // bot start
    this.init();
    this.commands();
    this.errorHandler();
  }
}
