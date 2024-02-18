import 'dotenv/config';

import container from '@config/inversify.config';

import { NBURateBotChartJob, NBURateBotDailyExchangesJob } from './cron-jobs';
import { expressServer } from './server';
import { NBURateBot } from './telegram';

(() => {
  expressServer.listen();

  container.get<NBURateBot>(NBURateBot);
  container.get<NBURateBotChartJob>(NBURateBotChartJob);
  container.get<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob);
})();
