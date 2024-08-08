import { inject, injectable } from 'inversify';
import { LanguageCode } from 'grammy/types';

import { AbstractBaseBot, ICommand } from '@telegram/common/base-bot';
import { LocalesDir } from '@telegram/common/symbols';
import { AuthData, TelegramUtils } from '@telegram/common/telegram-utils';
import { Logger } from '@helpers/logger';

import { ReactClickerBotPlayCommand, ReactClickerBotStartCommand } from './commands';
import { COMMANDS } from './react-clicker.utils';
import { ReactClickerBotContext } from './react-clicker.utils';
import { ReactClickerBotToken, ReactClickerDefaultLang, ReactClickerSupportedLangs } from './symbols';

@injectable()
export class ReactClickerBot extends AbstractBaseBot<ReactClickerBotContext> {
  constructor(
    @inject(TelegramUtils) private readonly _telegramUtils: TelegramUtils,
    @inject(ReactClickerBotToken.$) private readonly _token: string,
    @inject(LocalesDir.$) localesDir: string,
    @inject(ReactClickerSupportedLangs.$) supportLangs: LanguageCode[],
    @inject(ReactClickerDefaultLang.$) defaultLang: LanguageCode,
    @inject(ReactClickerBotStartCommand) reactClickerBotStartCommand: ReactClickerBotStartCommand,
    @inject(ReactClickerBotPlayCommand) reactClickerBotPlayCommand: ReactClickerBotPlayCommand,
    @inject(Logger) logger: Logger,
  ) {
    super(
      _token,
      defaultLang,
      localesDir,
      ReactClickerBot.createCommandsMap(reactClickerBotStartCommand, reactClickerBotPlayCommand),
      ReactClickerBot.createDescriptorsMap(),
      supportLangs,
      defaultLang,
      logger,
    );
  }

  // private test(): void {
  //   this._bot.on('', async (ctx: ReactClickerBotContext) => {
  //     console.log(ctx.message);
  //   });
  // }

  private static createCommandsMap(
    startCommand: ReactClickerBotStartCommand,
    playCommand: ReactClickerBotPlayCommand,
  ): Map<string, { instance: ICommand }> {
    return new Map<string, { instance: ICommand }>([
      [COMMANDS.START, { instance: startCommand }],
      [COMMANDS.PLAY, { instance: playCommand }],
    ]);
  }

  private static createDescriptorsMap(): Map<string, string> {
    return new Map<string, string>([
      [COMMANDS.START, 'react-clicker-bot-start-command-descriptor'],
      [COMMANDS.PLAY, 'react-clicker-bot-play-command-descriptor'],
    ]);
  }

  public async verifyAuth(authData: AuthData): Promise<boolean> {
    return this._telegramUtils.verifyAuth(authData.initData, this._token);
  }
}
