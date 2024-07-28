import { injectable } from 'inversify';
import { Bot, Composer, GrammyError, HttpError, session } from 'grammy';
import { I18n } from '@grammyjs/i18n';
import { LanguageCode } from 'grammy/types';
import { emojiParser } from '@grammyjs/emoji';

import { Logger } from '@helpers/logger';
import { BotContext, ICommand } from './types';

@injectable()
export abstract class BaseBot<T extends BotContext> {
  protected readonly _bot: Bot<T>;
  protected readonly _composer: Composer<T>;
  protected readonly _i18n: I18n<T>;
  private readonly _commandsMethodsConfig: Map<string, { instance: ICommand }>;
  private readonly _commandsMenuConfig: Map<string, string>;
  private readonly _supportLangs: LanguageCode[];
  private readonly _defaultLang: LanguageCode;

  constructor(
    token: string,
    defaultLocale: LanguageCode,
    localesDir: string,
    commandsMethodsConfig: Map<string, { instance: ICommand }>,
    commandsMenuConfig: Map<string, string>,
    supportLangs: LanguageCode[],
    defaultLang: LanguageCode,
  ) {
    this._bot = new Bot<T>(token);
    this._composer = new Composer<T>();
    this._i18n = new I18n<T>({
      defaultLocale: defaultLocale,
      useSession: true,
      directory: localesDir,
    });
    this._commandsMethodsConfig = commandsMethodsConfig;
    this._commandsMenuConfig = commandsMenuConfig;
    this._supportLangs = supportLangs;
    this._defaultLang = defaultLang;
  }

  private registerCommands(): void {
    for (const [command, { instance }] of [...this._commandsMethodsConfig.entries()]) {
      this._bot.command(command, (ctx) => instance.withCtx(ctx));
      Logger.info(`Registered command: ${command}`);
    }
  }

  private async setCommandsMenu(): Promise<void> {
    await Promise.all(
      this._supportLangs.map(async (lang) => {
        await this._bot.api.setMyCommands(
          [...this._commandsMenuConfig.entries()].map(([command, translateKey]) => ({
            command,
            description: this._i18n.t(lang, translateKey),
          })),
          { language_code: lang === this._defaultLang ? undefined : lang },
        );
        Logger.info(`Set commands menu for language: ${lang}`);
      }),
    );
  }

  protected errorHandler(): void {
    this._bot.catch((err) => {
      const ctx = err.ctx;
      Logger.error(`Error while handling update ${ctx.update.update_id}:`);
      const e = err.error;
      if (e instanceof GrammyError) {
        Logger.error('Error in request:', e.description);
      } else if (e instanceof HttpError) {
        Logger.error('Could not contact Telegram:', e);
      } else {
        Logger.error('Unknown error:', e);
      }
    });
  }

  protected handleError(): void {
    this.errorHandler();
  }

  protected additionalMiddlewares(): void {}

  protected async initBot(): Promise<void> {
    await this.setCommandsMenu();
    await this._bot.start({
      onStart: (bot) => {
        Logger.info(`Bot started: ${this.constructor.name}`, bot);
      },
      drop_pending_updates: true,
    });
  }

  public botStart(): void {
    this._bot.use(emojiParser());
    this._bot.use(
      session({
        initial: () => ({}),
      }),
    );

    this._bot.use(this._composer);
    this._composer.use(this._i18n);

    this.additionalMiddlewares();

    this.initBot();
    this.registerCommands();
    this.handleError();
  }

  public get bot(): Bot<T> {
    return this._bot;
  }

  public get i18n(): I18n<T> {
    return this._i18n;
  }
}
