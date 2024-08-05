import { ContainerModule } from 'inversify';

import { ExpressApp } from '@server/express-server';
import { PrettyTableCreator } from '@helpers/table-creator';
import { GlobalUtils } from '@helpers/global-utils';
import { Logger } from '@helpers/logger';

import { ContactUrl, ENV, LogLevel, PORT } from './symbols';

export const configModule = new ContainerModule((bind) => {
  bind<string>(ENV.$).toConstantValue(process.env.ENV!);
  bind<string>(PORT.$).toConstantValue(process.env.PORT!);
  bind<string>(LogLevel.$).toConstantValue(process.env.LOG_LEVEL!);
  bind<string>(ContactUrl.$).toConstantValue(process.env.CONTACT_URL!);

  bind<ExpressApp>(ExpressApp).toSelf();
  bind<PrettyTableCreator>(PrettyTableCreator).toSelf();
  bind<GlobalUtils>(GlobalUtils).toSelf();
  bind<Logger>(Logger).toSelf();
});
