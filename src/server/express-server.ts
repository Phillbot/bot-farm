import express, { Application, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { NBURateBot, ReactClickerBot } from '@telegram/index';
import { NBURateBotDailyExchangesJob } from '@cron-jobs/nbu-rate-bot-daily-exchanges.job';
import { NBURateBotChartJob } from '@cron-jobs/nbu-rate-bot-chart.job';
import { GlobalUtils } from '@helpers/global-utils';
import { Logger } from '@helpers/logger';

import { router } from './router';

const defaultPort = 8080;

@injectable()
export class ExpressApp {
  private readonly _app: Application;
  private readonly _PORT: number = process.env.PORT ? Number(process.env.PORT) : defaultPort;

  constructor(
    @inject(NBURateBot) private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotChartJob) private readonly _nbuRateBotChartJob: NBURateBotChartJob,
    @inject(NBURateBotDailyExchangesJob) private readonly _nbuRateBotDailyExchangesJob: NBURateBotDailyExchangesJob,
    @inject(ReactClickerBot) private readonly _reactClickerBot: ReactClickerBot,
    @inject(GlobalUtils) private readonly _globalUtils: GlobalUtils,
  ) {
    this._app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.bootstrap();
  }

  private setupMiddleware(): void {
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this._app.use(router);

    this._app.use((err: Error, req: Request, res: Response) => {
      Logger.error(err.stack || 'Some error in app use');
      res.status(500).json({ error: 'Something went wrong!' });
    });
  }

  private async listen(): Promise<void> {
    this._app.listen(this._PORT, async () => {
      try {
        const cat = await this._globalUtils.getRandomCat();

        Logger.info({
          server: ExpressApp.name,
          status: 'ok',
          port: this._PORT,
          cat: cat?.url,
        });
      } catch (error) {
        Logger.error('Error during server startup:', error, { status: 'failed' });
      }
    });
  }

  private bootstrap(): void {
    this.listen().catch((error) => {
      Logger.error('Bootstrap error:', error);
    });

    try {
      this._nbuRateBot.botStart();
      this._nbuRateBotChartJob.start();
      this._nbuRateBotDailyExchangesJob.start();
      this._reactClickerBot.botStart();
    } catch (error) {
      Logger.error('Error during bot or job startup:', error);
    }
  }
}
