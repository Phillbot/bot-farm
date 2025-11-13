import { ContainerModule } from 'inversify';

import { ApiRouter } from './api.router';
import { ExpressApp } from './express-server';
import { HealthService } from './health/health.service';
import { LandingRouter } from './landing/landing.router';

export const serverModule = new ContainerModule((bind) => {
  bind<ExpressApp>(ExpressApp).toSelf();
  bind<ApiRouter>(ApiRouter).toSelf();
  bind<LandingRouter>(LandingRouter).toSelf();
  bind<HealthService>(HealthService).toSelf();
});
