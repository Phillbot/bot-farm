import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { ReactClickerBot } from '@telegram/index';

import { getMe } from './controllers/get-me.controller';
import { authMiddleware } from './middlewares/auth.middleware';

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
  }
}
