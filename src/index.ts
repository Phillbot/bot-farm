import 'dotenv/config';
import '@config/i18n.config';
import container from '@config/inversify.config';

import { expressServer } from './server';
import { NBURateBot } from './telegram';
import { NBURateBotChartJob, NBURateBotDailyExchangesJob } from './cron-jobs';

(() => {
  expressServer.listen();

  container.get<NBURateBot>(NBURateBot);
  container.get<NBURateBotChartJob>(NBURateBotChartJob);
  container.get<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob);
})();
