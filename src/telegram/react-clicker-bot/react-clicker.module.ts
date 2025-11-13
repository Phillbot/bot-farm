import { LanguageCode } from 'grammy/types';
import { ContainerModule, interfaces } from 'inversify';

import { getReactClickerConfigOrThrow } from '@config/environment';

import { ReactClickerBotPlayCommand, ReactClickerBotStartCommand } from '@telegram/react-clicker-bot/commands';

import { ReactClickerBot } from './react-clicker.bot';
import { defaultLang, supportedLangs } from './react-clicker.utils';
import {
  ReactClickerAppGameUrl,
  ReactClickerBotToken,
  ReactClickerDefaultLang,
  ReactClickerSessionDuration,
  ReactClickerSupportedLangs,
  ReactClickerTimeZone,
} from './symbols';

export const reactClickerBotModule = new ContainerModule((bind: interfaces.Bind) => {
  const reactClickerConfig = getReactClickerConfigOrThrow();

  bind<string>(ReactClickerBotToken.$).toConstantValue(reactClickerConfig.botToken);
  bind<string>(ReactClickerSessionDuration.$).toConstantValue(reactClickerConfig.sessionDurationSeconds);
  bind<string>(ReactClickerAppGameUrl.$).toConstantValue(reactClickerConfig.gameUrl);
  bind<string>(ReactClickerTimeZone.$).toConstantValue(reactClickerConfig.botTimezone);

  bind<LanguageCode[]>(ReactClickerSupportedLangs.$).toConstantValue(supportedLangs);
  bind<LanguageCode>(ReactClickerDefaultLang.$).toConstantValue(defaultLang);

  bind<ReactClickerBot>(ReactClickerBot).toSelf();
  bind<ReactClickerBotStartCommand>(ReactClickerBotStartCommand).toSelf();
  bind<ReactClickerBotPlayCommand>(ReactClickerBotPlayCommand).toSelf();
});
