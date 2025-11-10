import { ContainerModule } from 'inversify';

import { ExpressApp } from '@server/express-server';
import { PrettyTableCreator } from '@helpers/table-creator';
import { GlobalUtils } from '@helpers/global-utils';
import { LOG_LEVEL, Logger } from '@helpers/logger';

import { environment } from './environment';
import { ContactUrl, ENV, LogLevel, PORT } from './symbols';

export const configModule = new ContainerModule((bind) => {
  bind<string>(ENV.$).toConstantValue(environment.app.env);
  bind<number>(PORT.$).toConstantValue(environment.app.port);
  bind<LOG_LEVEL>(LogLevel.$).toConstantValue(environment.app.logLevel);
  bind<string>(ContactUrl.$).toConstantValue(environment.app.contactUrl);

  bind<ExpressApp>(ExpressApp).toSelf();
  bind<PrettyTableCreator>(PrettyTableCreator).toSelf();
  bind<GlobalUtils>(GlobalUtils).toSelf();
  bind<Logger>(Logger).toSelf();
});
