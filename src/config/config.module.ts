import { ContainerModule } from 'inversify';

import { CronStatusRegistry } from '@helpers/cron-status.registry';
import { GlobalUtils } from '@helpers/global-utils';
import { LOG_LEVEL, Logger } from '@helpers/logger';
import { PrettyTableCreator } from '@helpers/table-creator';

import { environment } from './environment';
import type { RequestLimitConfig } from './environment';
import { ContactUrl, ENV, LogLevel, LoggerToken, PORT, RequestLimitConfigSymbol } from './symbols';

export const configModule = new ContainerModule((bind) => {
  bind<string>(ENV.$).toConstantValue(environment.app.env);
  bind<number>(PORT.$).toConstantValue(environment.app.port);
  bind<LOG_LEVEL>(LogLevel.$).toConstantValue(environment.app.logLevel);
  bind<string>(ContactUrl.$).toConstantValue(environment.app.contactUrl);

  bind<PrettyTableCreator>(PrettyTableCreator).toSelf();
  bind<GlobalUtils>(GlobalUtils).toSelf();
  bind<Logger>(LoggerToken.$).to(Logger).inSingletonScope();
  bind<RequestLimitConfig>(RequestLimitConfigSymbol.$).toConstantValue(environment.app.requestLimit);
  bind<CronStatusRegistry>(CronStatusRegistry).toSelf();
});
