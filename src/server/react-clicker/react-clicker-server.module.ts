import { ContainerModule, interfaces } from 'inversify';

import { getReactClickerConfigOrThrow } from '@config/environment';

import { BaseController } from './base-controller';
import { CreateUserController } from './controllers/create-user.controller';
import { GetMeController } from './controllers/get-me.controller';
import { LogoutController } from './controllers/logout.controller';
import { ReferralRewardController } from './controllers/referral-reward.controller';
import { UpdateAbilityController } from './controllers/update-ability.controller';
import { UpdateBalanceController } from './controllers/update-balance.controller';
import { UpdateBoostController } from './controllers/update-boost.controller';
import { UpdateEnergyController } from './controllers/update-energy.controller';
import { UpdateLastLoginController } from './controllers/update-last-login.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { TokenValidateMiddleware } from './middlewares/token-validate.middleware';
import { ReactClickerBotRouter } from './react-clicker.router';
import { SALT } from './symbols';

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
