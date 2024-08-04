import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { ReactClickerBot } from '@telegram/index';
import { Logger } from '@helpers/logger';

@injectable()
export class ReactClickerBotRouter {
  public router: Router;

  constructor(@inject(ReactClickerBot) private readonly _reactClickerBot: ReactClickerBot) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/auth', this.handleAuth);
  }

  private handleAuth = async (req: Request, res: Response): Promise<void> => {
    const { initData } = req.body;

    try {
      const isValid = await this._reactClickerBot.verifyAuth({ initData });

      if (isValid) {
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch (error) {
      Logger.error('Auth error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
}
