import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { ReactClickerBot } from '@telegram/index';

import { getMe } from './controllers/get-me.controller';
import { authMiddleware } from './middlewares/auth.middleware';
import { updateBalance } from './controllers/update-balance.controller';
import { logout } from './controllers/logout.controller';
import { updateEnergy } from './controllers/update-energy.controller';
import { updateBoost } from './controllers/update-boost.controller';
import { updateAbility } from './controllers/update-ability.controller';

@injectable()
export class ReactClickerBotRouter {
  public router: Router;

  constructor(@inject(ReactClickerBot) private readonly _reactClickerBot: ReactClickerBot) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(authMiddleware(this._reactClickerBot));

    this.router.post('/getMe', getMe);
    this.router.post('/updateBalance', updateBalance);
    this.router.post('/updateEnergy', updateEnergy);
    this.router.post('/updateBoost', updateBoost);
    this.router.post('/updateAbility', updateAbility);
    this.router.post('/logout', logout);
  }
}
