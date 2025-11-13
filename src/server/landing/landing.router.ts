import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';

import { ContactUrl, LoggerToken } from '@config/symbols';

import { GlobalUtils } from '@helpers/global-utils';
import { Logger } from '@helpers/logger';

@injectable()
export class LandingRouter {
  public readonly router: Router;

  constructor(
    private readonly _globalUtils: GlobalUtils,
    @inject(LoggerToken.$)
    private readonly _logger: Logger,
    @inject(ContactUrl.$)
    private readonly _contactUrl: string,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('*', this.renderLanding);
  }

  private renderLanding = async (_: Request, res: Response): Promise<void> => {
    try {
      const cat = await this._globalUtils.getRandomCat();
      res.render('index', { cat: cat?.url, telegram: this._contactUrl });
    } catch (error) {
      this._logger.error('Failed to render the landing page:', error);
      res.status(500).send('Unable to load the page');
    }
  };
}
