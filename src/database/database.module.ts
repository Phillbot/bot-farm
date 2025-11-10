import { ContainerModule } from 'inversify';

import { featureFlags } from '@config/feature-flags';

import { NBURateBotPostgresqlSequelize } from './nbu-rate-bot/nbu-rate-bot.db';
import { NBUCurrencyBotUserService } from './nbu-rate-bot/nbu-rate-bot-user.service';
import { NbuBotPostgresConnectUrl, ReactClickerPostgresConnectUrl } from './symbols';
import { ReactClickerBotSequelize } from './react-clicker-bot/react-clicker-bot.db';
import { ReactClickerBotPlayerService } from './react-clicker-bot/react-clicker-bot-player.service';

export const databaseModule = new ContainerModule((bind) => {
  bind<NBURateBotPostgresqlSequelize>(NBURateBotPostgresqlSequelize).toSelf();
  bind<NBUCurrencyBotUserService>(NBUCurrencyBotUserService).toSelf();
  bind<string>(NbuBotPostgresConnectUrl.$).toConstantValue(
    process.env.NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL!,
  );

  if (featureFlags.reactClickerEnabled) {
    const reactClickerDbUrl = process.env.REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL;

    if (!reactClickerDbUrl) {
      throw new Error('REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL must be set when the React Clicker feature is enabled.');
    }

    bind<string>(ReactClickerPostgresConnectUrl.$).toConstantValue(reactClickerDbUrl);
    bind<ReactClickerBotSequelize>(ReactClickerBotSequelize).toSelf();
    bind<ReactClickerBotPlayerService>(ReactClickerBotPlayerService).toSelf();
  }
});
