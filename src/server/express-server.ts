import express from 'express';
import { inject, injectable } from 'inversify';

import { NBURateBot, ReactClickerBot } from '@telegram/index';
import { NBURateBotDailyExchangesJob } from '@cron-jobs/nbu-rate-bot-daily-exchanges.job';
import { NBURateBotChartJob } from '@cron-jobs/nbu-rate-bot-chart.job';
import { GlobalUtils } from '@helpers/global-utils';

import { router } from './router';

const defaultPort = 8080;

@injectable()
export class ExpressApp {
  private readonly _app: express.Application;
  private readonly _PORT: number = process.env.PORT ? Number(process.env.PORT) : defaultPort;

  constructor(
    @inject(NBURateBot) private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotChartJob) private readonly _nbuRateBotChartJob: NBURateBotChartJob,
    @inject(NBURateBotDailyExchangesJob) private readonly _nbuRateBotDailyExchangesJob: NBURateBotDailyExchangesJob,
    @inject(ReactClickerBot) private readonly _reactClickerBot: ReactClickerBot,
    @inject(GlobalUtils) private readonly _globalUtils: GlobalUtils,
  ) {
    this._app = express();
    this.bootstrap();
  }
  private listen(): void {
    this._app.listen(this._PORT, async () => {
      try {
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));

        router(this._app);

        const { url } = await this._globalUtils.getRandomCat();

        // eslint-disable-next-line
        await console.table({
          server: ExpressApp.name,
          ok: true,
          port: this._PORT,
          cat: url,
        });
      } catch (error) {
        // eslint-disable-next-line
        console.table({ ok: false });
      }
    });
  }

  private bootstrap() {
    this.listen();
    this._nbuRateBot.botStart();
    this._nbuRateBotChartJob.start();
    this._nbuRateBotDailyExchangesJob.start();

    this._reactClickerBot.botStart();
  }
}
