import { ContainerModule, interfaces } from 'inversify';
import { LanguageCode } from 'grammy/types';

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
  bind<string>(ReactClickerBotToken.$).toConstantValue(process.env.REACT_CLICKER_APP_BOT_TOKEN!);
  bind<string>(ReactClickerSessionDuration.$).toConstantValue(process.env.REACT_CLICKER_APP_SESSION_DURATION_S!);
  bind<string>(ReactClickerAppGameUrl.$).toConstantValue(process.env.REACT_CLICKER_APP_GAME_URL!);
  bind<string>(ReactClickerTimeZone.$).toConstantValue(process.env.REACT_CLICKER_APP_BOT_TIME_ZONE!);

  bind<LanguageCode[]>(ReactClickerSupportedLangs.$).toConstantValue(supportedLangs);
  bind<LanguageCode>(ReactClickerDefaultLang.$).toConstantValue(defaultLang);

  bind<ReactClickerBot>(ReactClickerBot).toSelf();
  bind<ReactClickerBotStartCommand>(ReactClickerBotStartCommand).toSelf();
  bind<ReactClickerBotPlayCommand>(ReactClickerBotPlayCommand).toSelf();
});
