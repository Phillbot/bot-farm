import { ContainerModule } from 'inversify';

import { NBURateBotPostgresqlSequelize } from './nbu-rate-bot/nbu-rate-bot.db';
import { NBUCurrencyBotUserService } from './nbu-rate-bot/nbu-rate-bot-user.service';
import { ReactClickerBotPlayerService } from './react-clicker-bot/react-clicker-bot-player.service';
import { ReactClickerBotSequelize } from './react-clicker-bot/react-clicker-bot.db';
import { NbuBotPostgresConnectUrl, ReactClickerPostgresConnectUrl } from './symbols';

export const databaseModule = new ContainerModule((bind) => {
  bind<NBURateBotPostgresqlSequelize>(NBURateBotPostgresqlSequelize).toSelf();
  bind<NBUCurrencyBotUserService>(NBUCurrencyBotUserService).toSelf();
  bind<string>(ReactClickerPostgresConnectUrl.$).toConstantValue(
    process.env.REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL!,
  );

  bind<ReactClickerBotSequelize>(ReactClickerBotSequelize).toSelf();
  bind<ReactClickerBotPlayerService>(ReactClickerBotPlayerService).toSelf();
  bind<string>(NbuBotPostgresConnectUrl.$).toConstantValue(
    process.env.NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL!,
  );
});
