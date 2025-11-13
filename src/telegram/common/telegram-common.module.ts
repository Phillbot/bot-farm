import path from 'path';

import { ContainerModule, interfaces } from 'inversify';

import { TelegramUtils } from '@telegram/common/telegram-utils';

import { LocalesDir } from './symbols';

export const telegramCommonModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<string>(LocalesDir.$).toConstantValue(path.join(__dirname, './locales'));
  bind<TelegramUtils>(TelegramUtils).toSelf();
});
