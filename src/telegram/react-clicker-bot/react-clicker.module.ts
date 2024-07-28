import { ContainerModule, interfaces } from 'inversify';
import { LanguageCode } from 'grammy/types';

import { ReactClickerBotPlayCommand, ReactClickerBotStartCommand } from '@telegram/react-clicker-bot/commands';

import { ReactClickerBot } from './react-clicker.bot';
import { defaultLang, supportedLangs } from './react-clicker.utils';
import { ReactClickerBotToken, ReactClickerDefaultLang, ReactClickerSupportedLangs } from './symbols';

export const reactClickerBotModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<string>(ReactClickerBotToken.$).toConstantValue(process.env.REACT_CLICKER_BOT_TOKEN!);
  bind<LanguageCode[]>(ReactClickerSupportedLangs.$).toConstantValue(supportedLangs);
  bind<LanguageCode>(ReactClickerDefaultLang.$).toConstantValue(defaultLang);

  bind<ReactClickerBot>(ReactClickerBot).toSelf();
  bind<ReactClickerBotStartCommand>(ReactClickerBotStartCommand).toSelf();
  bind<ReactClickerBotPlayCommand>(ReactClickerBotPlayCommand).toSelf();
});
