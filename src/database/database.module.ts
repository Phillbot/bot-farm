import { ContainerModule } from 'inversify';

import { getNbuConfigOrThrow, getReactClickerConfigOrThrow } from '@config/environment';
import { featureFlags } from '@config/feature-flags';

import { NBUCurrencyBotUserService } from './nbu-rate-bot/nbu-rate-bot-user.service';
import { NBURateBotPostgresqlSequelize } from './nbu-rate-bot/nbu-rate-bot.db';
import { ReactClickerBotPlayerService } from './react-clicker-bot/react-clicker-bot-player.service';
import { ReactClickerBotSequelize } from './react-clicker-bot/react-clicker-bot.db';
import { NbuBotPostgresConnectUrl, NbuBotPostgresPort, ReactClickerPostgresConnectUrl } from './symbols';

export const databaseModule = new ContainerModule((bind) => {
  if (featureFlags.nbuEnabled) {
    const nbuConfig = getNbuConfigOrThrow();

    bind<NBURateBotPostgresqlSequelize>(NBURateBotPostgresqlSequelize).toSelf();
    bind<NBUCurrencyBotUserService>(NBUCurrencyBotUserService).toSelf();
    bind<string>(NbuBotPostgresConnectUrl.$).toConstantValue(nbuConfig.postgresUrl);

    if (nbuConfig.postgresPort) {
      bind<number>(NbuBotPostgresPort.$).toConstantValue(nbuConfig.postgresPort);
    }
  }

  if (featureFlags.reactClickerEnabled) {
    const reactClickerConfig = getReactClickerConfigOrThrow();

    bind<string>(ReactClickerPostgresConnectUrl.$).toConstantValue(reactClickerConfig.postgresUrl);
    bind<ReactClickerBotSequelize>(ReactClickerBotSequelize).toSelf();
    bind<ReactClickerBotPlayerService>(ReactClickerBotPlayerService).toSelf();
  }
});
