import { ContainerModule, interfaces } from 'inversify';

import { getReactClickerConfigOrThrow } from '@config/environment';
import { ReactClickerBotRouter } from './react-clicker.router';
import { TokenValidateMiddleware } from './middlewares/token-validate.middleware';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { GetMeController } from './controllers/get-me.controller';
import { CreateUserController } from './controllers/create-user.controller';
import { UpdateAbilityController } from './controllers/update-ability.controller';
import { LogoutController } from './controllers/logout.controller';
import { UpdateBalanceController } from './controllers/update-balance.controller';
import { UpdateEnergyController } from './controllers/update-energy.controller';
import { UpdateBoostController } from './controllers/update-boost.controller';
import { UpdateLastLoginController } from './controllers/update-last-login.controller';
import { BaseController } from './base-controller';
import { ReferralRewardController } from './controllers/referral-reward.controller';
import { SALT } from './symbols';

// TODO: Create common serve module

export const reactClickerServerModule = new ContainerModule((bind: interfaces.Bind) => {
  const reactClickerConfig = getReactClickerConfigOrThrow();

  bind<string>(SALT.$).toConstantValue(reactClickerConfig.salt);
  bind<ReactClickerBotRouter>(ReactClickerBotRouter).toSelf();

  bind<TokenValidateMiddleware>(TokenValidateMiddleware).toSelf();
  bind<AuthMiddleware>(AuthMiddleware).toSelf();

  bind<BaseController>(BaseController).toSelf();

  bind<GetMeController>(GetMeController).toSelf();
  bind<CreateUserController>(CreateUserController).toSelf();
  bind<UpdateBalanceController>(UpdateBalanceController).toSelf();
  bind<UpdateEnergyController>(UpdateEnergyController).toSelf();
  bind<UpdateBoostController>(UpdateBoostController).toSelf();
  bind<UpdateAbilityController>(UpdateAbilityController).toSelf();
  bind<UpdateLastLoginController>(UpdateLastLoginController).toSelf();
  bind<ReferralRewardController>(ReferralRewardController).toSelf();
  bind<LogoutController>(LogoutController).toSelf();
});
