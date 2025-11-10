import path from 'path';
import express, { Application, Request, Response } from 'express';
import { inject, injectable, optional } from 'inversify';
import { Random } from 'some-random-cat';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import { NBURateBot, ReactClickerBot } from '@telegram';
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
    @inject(PORT.$)
    private readonly _port: number,
    @inject(ContactUrl.$)
    private readonly _contactUrl: string,
    private readonly _nbuRateBot: NBURateBot,
    private readonly _nbuRateBotChartJob: NBURateBotChartJob,
    private readonly _nbuRateBotDailyExchangesJob: NBURateBotDailyExchangesJob,
    private readonly _globalUtils: GlobalUtils,
    private readonly _logger: Logger,
    @optional()
    private readonly _reactClickerBot?: ReactClickerBot,
    @optional()
    private readonly _reactClickerBotRouter?: ReactClickerBotRouter,
  ) {
    this._app = express();

    this.setupMiddleware();
    this.setupViews();
    this.setupRoutes();
    this.bootstrap();
  }

  private setupMiddleware(): void {
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 100,
      message: {
        success: false,
        message: 'Too many requests, please try again later.',
      },
      headers: true,
    });

    this._app.use(cors()); // TODO: Configure CORS via .env
    this._app.use(limiter);
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));
  }

  private setupViews(): void {
    this._app.set('views', path.join(process.cwd(), 'src/server/views'));
    this._app.set('view engine', 'ejs');
    this._app.use(express.static(path.join(process.cwd(), 'public')));
  }

  private setupRoutes(): void {
    // 📌 API and bots
    this._app.use('/api', router);
    if (this._reactClickerBotRouter) {
      this._app.use('/react-clicker-bot', this._reactClickerBotRouter.router);
    }

    // 📌 Main view route
    this._app.get('*', async (_: Request, res: Response) => {
      try {
        const cat = await Random.getCat();
        res.render('index', { cat: cat?.url, telegram: this._contactUrl });
      } catch (error) {
        this._logger.error('Failed to render the landing page:', error);
        res.status(500).send('Unable to load the page');
      }
    });

    // 📌 Errors
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
        this._logger.error('Failed to start the server:', error, { status: 'failed' });
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
      if (this._reactClickerBot) {
        this._reactClickerBot.botStart();
      }
    } catch (error) {
      this._logger.error('Error during bot or job startup:', error);
    }
  }
}
