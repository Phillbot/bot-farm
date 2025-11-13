import { LanguageCode } from 'grammy/types';
import { inject, injectable } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { AbstractBaseBot } from '@telegram/common/base-bot';
import { CommandDefinition } from '@telegram/common/base-bot/types';
import { LocalesDir } from '@telegram/common/symbols';
import { AuthData, TelegramUtils } from '@telegram/common/telegram-utils';

import { ReactClickerBotPlayCommand, ReactClickerBotStartCommand } from './commands';
import { COMMANDS } from './react-clicker.utils';
import { ReactClickerBotContext } from './react-clicker.utils';
import { ReactClickerBotToken, ReactClickerDefaultLang, ReactClickerSupportedLangs } from './symbols';

@injectable()
export class ReactClickerBot extends AbstractBaseBot<ReactClickerBotContext> {
  constructor(
    @inject(ReactClickerBotToken.$) private readonly _token: string,
    @inject(LocalesDir.$) localesDir: string,
    @inject(ReactClickerSupportedLangs.$) supportLangs: LanguageCode[],
    @inject(ReactClickerDefaultLang.$) defaultLang: LanguageCode,
    reactClickerBotStartCommand: ReactClickerBotStartCommand,
    reactClickerBotPlayCommand: ReactClickerBotPlayCommand,
    @inject(LoggerToken.$) logger: Logger,
    private readonly _telegramUtils: TelegramUtils,
  ) {
    super({
      token: _token,
      defaultLocale: defaultLang,
      localesDir,
      commands: ReactClickerBot.createCommandDefinitions(reactClickerBotStartCommand, reactClickerBotPlayCommand),
      supportedLangs: supportLangs,
      logger,
    });
  }

  private static createCommandDefinitions(
    startCommand: ReactClickerBotStartCommand,
    playCommand: ReactClickerBotPlayCommand,
  ): CommandDefinition[] {
    return [
      {
        command: COMMANDS.START,
        handler: startCommand,
        descriptionKey: 'react-clicker-bot-start-command-descriptor',
      },
      {
        command: COMMANDS.PLAY,
        handler: playCommand,
        descriptionKey: 'react-clicker-bot-play-command-descriptor',
      },
    ];
  }

  public async verifyAuth(authData: AuthData): Promise<boolean> {
    return this._telegramUtils.verifyAuth(authData.initData, this._token);
  }
}
