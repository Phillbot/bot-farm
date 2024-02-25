import express from 'express';
import { inject, injectable } from 'inversify';

import { NBURateBot } from '@telegram/index';
import { NBURateBotDailyExchangesJob } from '@cron-jobs/nbu-rate-bot-daily-exchanges.job';
import { NBURateBotChartJob } from '@cron-jobs/nbu-rate-bot-chart.job';
import { GlobalUtils } from '@helpers/global-utils';

import { serverConfig } from './config';
import { router } from './router';

@injectable()
export class ExpressApp {
  private readonly _app: express.Application;

  constructor(
    @inject(NBURateBot) private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotChartJob)
    private readonly _nbuRateBotChartJob: NBURateBotChartJob,
    @inject(NBURateBotDailyExchangesJob)
    private readonly _nbuRateBotDailyExchangesJob: NBURateBotDailyExchangesJob,
    @inject(GlobalUtils)
    private readonly _globalUtils: GlobalUtils,
  ) {
    this._app = express();
    this.bootstrap();
  }
  private listen(): void {
    this._app.listen(serverConfig.port, async () => {
      try {
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));

        router(this._app);

        const catUrl = await this._globalUtils.getRandomCatUrl();

        // eslint-disable-next-line
        await console.table({
          server: ExpressApp.name,
          ok: true,
          port: serverConfig.port,
          cat: catUrl,
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
  }
}
