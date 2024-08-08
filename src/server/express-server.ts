import express, { Application, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Random } from 'some-random-cat';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import { NBURateBot, ReactClickerBot } from '@telegram/index';
import { NBURateBotDailyExchangesJob } from '@cron-jobs/nbu-rate-bot-daily-exchanges.job';
import { NBURateBotChartJob } from '@cron-jobs/nbu-rate-bot-chart.job';
import { GlobalUtils } from '@helpers/global-utils';
import { Logger } from '@helpers/logger';

import { ContactUrl, PORT } from '@config/symbols';

import { ReactClickerBotRouter } from './react-clicker/react-clicker.router';
import { router } from './router';

const defaultPort = 8080;

@injectable()
export class ExpressApp {
  private readonly _app: Application;
  private readonly _PORT: number = this._port ?? defaultPort;

  constructor(
    @inject(PORT.$) private readonly _port: number,
    @inject(ContactUrl.$) private readonly _contactUrl: string,
    @inject(NBURateBot) private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotChartJob) private readonly _nbuRateBotChartJob: NBURateBotChartJob,
    @inject(NBURateBotDailyExchangesJob) private readonly _nbuRateBotDailyExchangesJob: NBURateBotDailyExchangesJob,
    @inject(ReactClickerBot) private readonly _reactClickerBot: ReactClickerBot,
    @inject(GlobalUtils) private readonly _globalUtils: GlobalUtils,
    @inject(ReactClickerBotRouter) private readonly _reactClickerBotRouter: ReactClickerBotRouter,
    @inject(Logger) private readonly _logger: Logger,
  ) {
    this._app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.bootstrap();
  }

  private setupMiddleware(): void {
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests, please try again later.',
      },
      headers: true,
    });

    this._app.use(cors()); // TODO: Setup cors from .ENV

    this._app.use(limiter);
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this._app.use('/api', router);
    this._app.use('/react-clicker-bot', this._reactClickerBotRouter.router);

    // TODO: Work with router, crate enums for base path

    // Handle other routes for Single Page Application
    this._app.get('*', async (_: Request, res: Response) => {
      const cat = await Random.getCat();
      res.send(
        `
          <div>
            <a href=${this._contactUrl} target='_blank'>Telegram</a>
            <img src=${cat?.url} alt='cat' />
          </div>
          `,
      );
    });

    this._app.use((err: Error, req: Request, res: Response) => {
      this._logger.error(err.stack || 'Some error in app use');
      res.status(500).json({ error: 'Something went wrong!' });
    });
  }

  private async listen(): Promise<void> {
    this._app.listen(this._PORT, async () => {
      try {
        const cat = await this._globalUtils.getRandomCat();

        this._logger.info({
          server: ExpressApp.name,
          status: 'ok',
          port: this._PORT,
          cat: cat?.url,
        });
      } catch (error) {
        this._logger.error('Error during server startup:', error, { status: 'failed' });
      }
    });
  }

  private bootstrap(): void {
    this.listen().catch((error) => {
      this._logger.error('Bootstrap error:', error);
    });

    try {
      this._nbuRateBot.botStart();
      this._nbuRateBotChartJob.start();
      this._nbuRateBotDailyExchangesJob.start();
      this._reactClickerBot.botStart();
    } catch (error) {
      this._logger.error('Error during bot or job startup:', error);
    }
  }
}
