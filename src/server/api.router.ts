import { Router } from 'express';
import { inject, injectable } from 'inversify';

import { ContactUrl, LoggerToken } from '@config/symbols';

import { GlobalUtils } from '@helpers/global-utils';
import { Logger } from '@helpers/logger';

import { HealthService } from './health/health.service';

@injectable()
export class ApiRouter {
  public readonly router: Router;

  constructor(
    private readonly _healthService: HealthService,
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
    this.router.get('/ping', (_req, res) => {
      res.json({ status: 'ok' });
    });

    this.router.get('/health', async (_req, res) => {
      try {
        const snapshot = await this._healthService.getSnapshot();
        res.status(snapshot.status === 'ok' ? 200 : 503).json(snapshot);
      } catch (error) {
        this._logger.error('API health endpoint failed', error);
        res.status(500).json({ status: 'error', message: 'Unable to collect health snapshot' });
      }
    });

    this.router.get('/cat', async (_req, res) => {
      try {
        const cat = await this._globalUtils.getRandomCat();
        if (!cat) {
          res.status(404).json({ success: false, message: 'Cat image not found' });
          return;
        }

        res.json({ success: true, url: cat.url });
      } catch (error) {
        this._logger.error('Failed to fetch cat from API endpoint', error);
        res.status(500).json({ success: false, message: 'Unable to load cat image' });
      }
    });

    this.router.get('/contact', (_req, res) => {
      res.json({ contactUrl: this._contactUrl });
    });
  }
}
