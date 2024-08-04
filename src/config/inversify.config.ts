import { Container } from 'inversify';

import { telegramCommonModule } from '@telegram/common/telegram-common.module';
import { nbuRateBotModule } from '@telegram/nbu-rate-bot/nbu-rate.module';
import { reactClickerBotModule } from '@telegram/react-clicker-bot/react-clicker.module';

import { reactClickerServerModule } from '@server/react-clicker/react-clicker-server.module';

import { configModule } from './config.module';

export const container = new Container({
  defaultScope: 'Singleton',
  skipBaseClassChecks: true, // TODO: investigate to remove
});

container.load(configModule, telegramCommonModule, reactClickerBotModule, nbuRateBotModule, reactClickerServerModule);
