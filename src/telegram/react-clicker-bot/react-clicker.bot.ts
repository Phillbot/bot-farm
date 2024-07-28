import { inject, injectable } from 'inversify';
import { LanguageCode } from 'grammy/types';

import { BaseBot, ICommand } from '@telegram/common/base-bot';
import { LocalesDir } from '@telegram/common/symbols';

import { ReactClickerBotPlayCommand, ReactClickerBotStartCommand } from './commands';
import { COMMANDS } from './react-clicker.utils';
import { ReactClickerBotContext } from './react-clicker.utils';
import { ReactClickerBotToken, ReactClickerDefaultLang, ReactClickerSupportedLangs } from './symbols';

@injectable()
export class ReactClickerBot extends BaseBot<ReactClickerBotContext> {
  constructor(
    @inject(ReactClickerBotToken.$) token: string,
    @inject(LocalesDir.$) localesDir: string,
    @inject(ReactClickerSupportedLangs.$) supportLangs: LanguageCode[],
    @inject(ReactClickerDefaultLang.$) defaultLang: LanguageCode,
    @inject(ReactClickerBotStartCommand) reactClickerBotStartCommand: ReactClickerBotStartCommand,
    @inject(ReactClickerBotPlayCommand) reactClickerBotPlayCommand: ReactClickerBotPlayCommand,
  ) {
    super(
      token,
      defaultLang,
      localesDir,
      ReactClickerBot.createCommandsMap(reactClickerBotStartCommand, reactClickerBotPlayCommand),
      ReactClickerBot.createDescriptorsMap(),
      supportLangs,
      defaultLang,
    );
  }

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
}
