import { Container } from 'inversify';

import { databaseModule } from '@database/database.module';
import { reactClickerServerModule } from '@server/react-clicker/react-clicker-server.module';
import { telegramCommonModule } from '@telegram/common/telegram-common.module';
import { nbuRateBotModule } from '@telegram/nbu-rate-bot/nbu-rate.module';
import { reactClickerBotModule } from '@telegram/react-clicker-bot/react-clicker.module';

import { configModule } from './config.module';
import { featureFlags } from './feature-flags';

export const container = new Container({
  defaultScope: 'Singleton',
  skipBaseClassChecks: true,
});

const modulesToLoad = [configModule, databaseModule, telegramCommonModule, nbuRateBotModule];

if (featureFlags.reactClickerEnabled) {
  modulesToLoad.push(reactClickerServerModule, reactClickerBotModule);
}

container.load(...modulesToLoad);
