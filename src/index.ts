import 'dotenv/config';

import container from '@config/inversify.config';

import { expressServer } from './server';
import { NBURateBot } from './telegram';
import { NBURateBotChartJob, NBURateBotDailyExchangesJob } from './cron-jobs';
import { NBURateBotPostgresqlSequelize } from './database';

/**
 * Here we start server
 * we need server instance for bot host
 * also we can use it for cron, logs etc
 */

expressServer.listen();

/**
 * Here we put databases connectors
 */

container.get<NBURateBotPostgresqlSequelize>(NBURateBotPostgresqlSequelize);

/**
 * Here we start bot
 * we can start any bots below
 */

container.get<NBURateBot>(NBURateBot);

/**
 * Here we cat run any cron Jobs
 */

container.get<NBURateBotChartJob>(NBURateBotChartJob);
container.get<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob);
