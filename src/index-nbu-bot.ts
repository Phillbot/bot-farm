import 'dotenv/config';
import 'reflect-metadata';

import { featureFlags } from '@config/feature-flags';
import { container } from '@config/inversify.config';
import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { NBURateBotChartJob } from '@cron-jobs/nbu-rate-bot-chart.job';
import { NBURateBotDailyExchangesJob } from '@cron-jobs/nbu-rate-bot-daily-exchanges.job';
import { NBURateBot } from '@telegram';

async function bootstrap(): Promise<void> {
  const logger = container.get<Logger>(LoggerToken.$);

  if (!featureFlags.nbuEnabled) {
    logger.warn('NBU Rate bot is disabled via ENABLED_BOTS. Skipping bot bootstrap.');
    return;
  }

  try {
    const nbuRateBot = container.get<NBURateBot>(NBURateBot);
    const nbuRateBotChartJob = container.get<NBURateBotChartJob>(NBURateBotChartJob);
    const nbuRateBotDailyExchangesJob = container.get<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob);

    nbuRateBot.botStart();
    nbuRateBotChartJob.start();
    nbuRateBotDailyExchangesJob.start();

    logger.info('NBU Rate bot and jobs started successfully');
  } catch (error) {
    logger.error('Failed to bootstrap NBU Rate bot process:', error);
    process.exit(1);
  }
}

bootstrap();
