import { Bot, Composer, GrammyError, HttpError, session } from 'grammy';
import { I18n } from '@grammyjs/i18n';
import { LanguageCode } from 'grammy/types';
import { emojiParser } from '@grammyjs/emoji';
import { injectable } from 'inversify';

import { Logger } from '@helpers/logger';
import { BotContext, ICommand } from './types';

@injectable()
export abstract class AbstractBaseBot<T extends BotContext> {
  protected readonly _bot: Bot<T>;
  protected readonly _composer: Composer<T>;
  protected readonly _i18n: I18n<T>;

  constructor(
    token: string,
    defaultLocale: LanguageCode,
    localesDir: string,
    private readonly _commandsMethodsConfig: Map<string, { instance: ICommand }>,
    private readonly _commandsMenuConfig: Map<string, string>,
    private readonly _supportedLangs: LanguageCode[],
    private readonly _defaultLang: LanguageCode,
    private readonly _logger: Logger,
    private readonly _specialUserIds?: number[],
    private readonly _specialCommandsMethodsConfig?: Map<string, { instance: ICommand }>,
    private readonly _specialCommandsMenuConfig?: Map<string, string>,
  ) {
    this._bot = new Bot<T>(token);
    this._composer = new Composer<T>();
    this._i18n = new I18n<T>({
      defaultLocale: defaultLocale,
      useSession: true,
      directory: localesDir,
    });
  }

  private registerCommands(): void {
    for (const [command, { instance }] of this._commandsMethodsConfig.entries()) {
      this._bot.command(command, (ctx) => instance.withCtx(ctx));
      this._logger.info(`Registered command: ${command}`);
    }

    if (this._specialCommandsMethodsConfig) {
      for (const [command, { instance }] of this._specialCommandsMethodsConfig.entries()) {
        this._bot.command(command, (ctx) => {
          if (this._specialUserIds?.includes(ctx.from?.id ?? -1)) {
            instance.withCtx(ctx);
            this._logger.info(`Registered special command for user: ${ctx.from?.id}`);
          }
        });
      }
    }
  }

  private async setCommandsMenu(): Promise<void> {
    await Promise.all(
      this._supportedLangs.map(async (lang) => {
        await this._bot.api.setMyCommands(
          [...this._commandsMenuConfig.entries()].map(([command, translateKey]) => ({
            command,
            description: this._i18n.t(lang, translateKey),
          })),
          { language_code: lang === this._defaultLang ? undefined : lang },
        );
        this._logger.info(`Set commands menu for language: ${lang}`);
      }),
    );

    if (this._specialUserIds && this._specialCommandsMenuConfig) {
      for (const userId of this._specialUserIds) {
        for (const lang of this._supportedLangs) {
          const allCommands = [...this._commandsMenuConfig.entries(), ...this._specialCommandsMenuConfig.entries()].map(
            ([command, translateKey]) => ({
              command,
              description: this._i18n.t(lang, translateKey),
            }),
          );

          await this._bot.api.setMyCommands(allCommands, {
            language_code: lang === this._defaultLang ? undefined : lang,
            scope: { type: 'chat', chat_id: userId },
          });

          this._logger.info(`Set special commands menu for user: ${userId} and language: ${lang}`);
        }
      }
    }
  }

  protected errorHandler(): void {
    this._bot.catch((err) => {
      const ctx = err.ctx;
      this._logger.error(`Error while handling update ${ctx.update.update_id}:`);
      const e = err.error;
      if (e instanceof GrammyError) {
        this._logger.error('Error in request:', e.description);
      } else if (e instanceof HttpError) {
        this._logger.error('Could not contact Telegram:', e);
      } else {
        this._logger.error('Unknown error:', e);
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
        this._logger.info(`Bot started: ${this.constructor.name}`, bot);
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
