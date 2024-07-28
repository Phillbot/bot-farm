import { ContainerModule } from 'inversify';

import { ExpressApp } from '@server/express-server';
import { PrettyTableCreator } from '@helpers/table-creator';
import { GlobalUtils } from '@helpers/global-utils';
import { Logger } from '@helpers/logger';

export const configModule = new ContainerModule((bind) => {
  bind<ExpressApp>(ExpressApp).toSelf();
  bind<PrettyTableCreator>(PrettyTableCreator).toSelf();
  bind<GlobalUtils>(GlobalUtils).toSelf();
  bind<Logger>(Logger).toSelf();
});
