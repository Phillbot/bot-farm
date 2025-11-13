import { Bot, Composer, GrammyError, HttpError, session } from 'grammy';
import { BotCommand, LanguageCode } from 'grammy/types';
import { injectable } from 'inversify';

import { Logger } from '@helpers/logger';

import { emojiParser } from '@grammyjs/emoji';
import { I18n } from '@grammyjs/i18n';

import { BotContext, CommandDefinition } from './types';

type SpecialCommandConfig = Readonly<{
  userIds: number[];
  commands: CommandDefinition[];
}>;

type SetCommandsOptions = Parameters<Bot<BotContext>['api']['setMyCommands']>[1];

export type BaseBotConfig = Readonly<{
  token: string;
  defaultLocale: LanguageCode;
  localesDir: string;
  commands: CommandDefinition[];
  supportedLangs: LanguageCode[];
  logger: Logger;
  specialCommands?: SpecialCommandConfig;
}>;

@injectable()
export abstract class AbstractBaseBot<T extends BotContext> {
  protected readonly _bot: Bot<T>;
  protected readonly _composer: Composer<T>;
  protected readonly _i18n: I18n<T>;
  protected readonly _logger: Logger;
  private readonly _commandDefinitions: CommandDefinition[];
  private readonly _supportedLangs: LanguageCode[];
  private readonly _defaultLang: LanguageCode;
  private readonly _specialCommands?: SpecialCommandConfig;

  constructor({ token, defaultLocale, localesDir, commands, supportedLangs, logger, specialCommands }: BaseBotConfig) {
    this._bot = new Bot<T>(token);
    this._composer = new Composer<T>();
    this._i18n = new I18n<T>({
      defaultLocale,
      useSession: true,
      directory: localesDir,
    });
    this._commandDefinitions = commands;
    this._supportedLangs = supportedLangs;
    this._defaultLang = defaultLocale;
    this._logger = logger;
    this._specialCommands = specialCommands;

    this.ensureUniqueCommands();
  }

  private registerCommands(): void {
    this._commandDefinitions.forEach((definition) => {
      this._bot.command(definition.command, (ctx) => definition.handler.withCtx(ctx));
      this._logger.info(`Registered command: ${definition.command}`);
    });

    if (!this._specialCommands) {
      return;
    }

    const allowedUsers = new Set(this._specialCommands.userIds);

    this._specialCommands.commands.forEach((definition) => {
      this._bot.command(definition.command, (ctx) => {
        if (!ctx.from?.id || !allowedUsers.has(ctx.from.id)) {
          return;
        }

        definition.handler.withCtx(ctx);
        this._logger.info(`Registered special command: ${definition.command} for user: ${ctx.from.id}`);
      });
    });
  }

  private async setCommandsMenu(): Promise<void> {
    await Promise.all(
      this._supportedLangs.map(async (lang) => {
        const commands = this.buildMenuPayload(lang, this._commandDefinitions);
        await this.safeSetCommands(commands, {
          language_code: lang === this._defaultLang ? undefined : lang,
        });
      }),
    );

    if (!this._specialCommands) {
      return;
    }

    const combinedDefinitions = [...this._commandDefinitions, ...this._specialCommands.commands];

    for (const userId of this._specialCommands.userIds) {
      for (const lang of this._supportedLangs) {
        const commands = this.buildMenuPayload(lang, combinedDefinitions);
        await this.safeSetCommands(commands, {
          language_code: lang === this._defaultLang ? undefined : lang,
          scope: { type: 'chat', chat_id: userId },
        });
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

  protected additionalMiddlewares(): void { }

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

    this.registerCommands();
    this.handleError();
    void this.initBot().catch((error) => this._logger.error(`Failed to initialize bot ${this.constructor.name}`, error));
  }

  public get bot(): Bot<T> {
    return this._bot;
  }

  public get i18n(): I18n<T> {
    return this._i18n;
  }

  private ensureUniqueCommands(): void {
    const names = new Set<string>();
    const duplicates = new Set<string>();

    const registerName = (command: string) => {
      if (names.has(command)) {
        duplicates.add(command);
      } else {
        names.add(command);
      }
    };

    this._commandDefinitions.forEach(({ command }) => registerName(command));
    this._specialCommands?.commands.forEach(({ command }) => registerName(command));

    if (duplicates.size > 0) {
      throw new Error(
        `Duplicate bot commands detected: ${Array.from(duplicates)
          .sort()
          .join(', ')}`,
      );
    }
  }

  private buildMenuPayload(lang: LanguageCode, definitions: CommandDefinition[]): BotCommand[] {
    return definitions.map(({ command, descriptionKey }) => ({
      command,
      description: this._i18n.t(lang, descriptionKey),
    }));
  }

  private async safeSetCommands(commands: BotCommand[], options?: SetCommandsOptions): Promise<void> {
    const appliedOptions = options ?? {};
    try {
      await this._bot.api.setMyCommands(commands, appliedOptions);
      this._logger.info(
        `Set commands menu for language: ${appliedOptions.language_code ?? this._defaultLang}${appliedOptions.scope ? `, scope: ${appliedOptions.scope.type}` : ''}`,
      );
    } catch (error) {
      this._logger.error(
        `Failed to set commands menu for language: ${appliedOptions.language_code ?? this._defaultLang}`,
        error,
      );
    }
  }
}
