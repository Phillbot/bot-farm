import { ContainerModule, interfaces } from 'inversify';
import { ReactClickerBotRouter } from './react-clicker.router';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { GetMeController } from './controllers/get-me.controller';
import { CreateUserController } from './controllers/create-user.controller';
import { UpdateAbilityController } from './controllers/update-ability.controller';
import { LogoutController } from './controllers/logout.controller';
import { UpdateBalanceController } from './controllers/update-balance.controller';
import { UpdateEnergyController } from './controllers/update-energy.controller';
import { UpdateBoostController } from './controllers/update-boost.controller';
import { BaseController } from './base-controller';

// TODO: Create common serve module

export const reactClickerServerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<ReactClickerBotRouter>(ReactClickerBotRouter).toSelf();

  bind<AuthMiddleware>(AuthMiddleware).toSelf();

  bind<BaseController>(BaseController).toSelf();

  bind<GetMeController>(GetMeController).toSelf();
  bind<CreateUserController>(CreateUserController).toSelf();
  bind<UpdateBalanceController>(UpdateBalanceController).toSelf();
  bind<UpdateEnergyController>(UpdateEnergyController).toSelf();
  bind<UpdateBoostController>(UpdateBoostController).toSelf();
  bind<UpdateAbilityController>(UpdateAbilityController).toSelf();
  bind<LogoutController>(LogoutController).toSelf();
});
