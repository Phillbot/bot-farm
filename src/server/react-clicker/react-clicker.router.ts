import { Request, RequestHandler, Response, Router } from 'express';
import { injectable } from 'inversify';

import { Logger } from '@helpers/logger';
import { TokenValidateMiddleware } from './middlewares/token-validate.middleware';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { GetMeController } from './controllers/get-me.controller';
import { CreateUserController } from './controllers/create-user.controller';
import { UpdateBalanceController } from './controllers/update-balance.controller';
import { UpdateEnergyController } from './controllers/update-energy.controller';
import { UpdateBoostController } from './controllers/update-boost.controller';
import { UpdateAbilityController } from './controllers/update-ability.controller';
import { LogoutController } from './controllers/logout.controller';
import { ReferralRewardController } from './controllers/referral-reward.controller';
import { UpdateLastLoginController } from './controllers/update-last-login.controller';

enum Routes {
  GET_ME = 'get-me',
  CREATE_USER = 'create-user',
  UPDATE_BALANCE = 'update-balance',
  UPDATE_ENERGY = 'update-energy',
  UPDATE_BOOST = 'update-boost',
  UPDATE_ABILITY = 'update-ability',
  UPDATE_LAST_LOGIN = 'update-last-login',
  REFERRAL_CLAIM_REWARD = 'referral-claim-reward',
  LOGOUT = 'logout',
}

type RouteMap = Readonly<{
  [key in Routes]: RequestHandler;
}>;

@injectable()
export class ReactClickerBotRouter {
  public router: Router;

  constructor(
    private readonly _tokenValidateMiddleware: TokenValidateMiddleware,
    private readonly _authMiddleware: AuthMiddleware,
    private readonly _getMeController: GetMeController,
    private readonly _createUserController: CreateUserController,
    private readonly _updateBalanceController: UpdateBalanceController,
    private readonly _updateEnergyController: UpdateEnergyController,
    private readonly _updateBoostController: UpdateBoostController,
    private readonly _updateAbilityController: UpdateAbilityController,
    private readonly _updateLastLoginController: UpdateLastLoginController,
    private readonly _referralRewardController: ReferralRewardController,
    private readonly _logoutController: LogoutController,
    private readonly _logger: Logger,
  ) {
    this.router = Router();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeRoutes(): void {
    this.router.use(this._tokenValidateMiddleware.handle);
    this.router.use(this._authMiddleware.handle);

    const routeMap: RouteMap = {
      [Routes.GET_ME]: this._getMeController.handle,
      [Routes.CREATE_USER]: this._createUserController.handle,
      [Routes.UPDATE_BALANCE]: this._updateBalanceController.handle,
      [Routes.UPDATE_ENERGY]: this._updateEnergyController.handle,
      [Routes.UPDATE_BOOST]: this._updateBoostController.handle,
      [Routes.UPDATE_ABILITY]: this._updateAbilityController.handle,
      [Routes.UPDATE_LAST_LOGIN]: this._updateLastLoginController.handle,
      [Routes.REFERRAL_CLAIM_REWARD]: this._referralRewardController.handle,
      [Routes.LOGOUT]: this._logoutController.handle,
    };

    Object.entries(routeMap).forEach(([route, handler]) => {
      this.router.post('/' + route, handler);
    });
  }

  private initializeErrorHandling(): void {
    // Handle 404 errors for undefined routes
    this.router.use((req: Request, res: Response) => {
      const { method, originalUrl, body, query } = req;
      this._logger.warn(
        `404 Not Found: ${method} ${originalUrl} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)}`,
      );

      res.status(404).json({ success: false, message: 'Not Found' });
    });

    // Global error handler
    this.router.use((err: unknown, req: Request, res: Response) => {
      if (err instanceof Error) {
        this._logger.error('Server Error:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      } else {
        this._logger.error('Unknown Error:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    });
  }
}
