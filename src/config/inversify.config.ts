import { Container } from 'inversify';

import { databaseModule } from '@database/database.module';
import { reactClickerServerModule } from '@server/react-clicker/react-clicker-server.module';

import { telegramCommonModule } from '@telegram/common/telegram-common.module';
import { nbuRateBotModule } from '@telegram/nbu-rate-bot/nbu-rate.module';
import { reactClickerBotModule } from '@telegram/react-clicker-bot/react-clicker.module';

import { configModule } from './config.module';

export const container = new Container({
  defaultScope: 'Singleton',
  skipBaseClassChecks: true, // TODO: investigate to remove
});

container.load(
  configModule,
  databaseModule,
  reactClickerServerModule,
  telegramCommonModule,
  reactClickerBotModule,
  nbuRateBotModule,
);
