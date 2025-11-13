import 'dotenv/config';
import 'reflect-metadata';

import { featureFlags } from '@config/feature-flags';
import { container } from '@config/inversify.config';
import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { NBURateBotChartJob } from '@cron-jobs/nbu-rate-bot-chart.job';
import { NBURateBotDailyExchangesJob } from '@cron-jobs/nbu-rate-bot-daily-exchanges.job';
import { ExpressApp } from '@server/express-server';
import { NBURateBot, ReactClickerBot } from '@telegram';

async function startExpress(logger: Logger): Promise<void> {
  try {
    const expressApp = container.get<ExpressApp>(ExpressApp);
    await expressApp.start();
    logger.info('Express server started');
  } catch (error) {
    logger.error('Failed to start Express server', error);
    throw error;
  }
}

function startNbuBot(logger: Logger): void {
  if (!featureFlags.nbuEnabled) {
    logger.info('NBU Rate bot disabled via ENABLED_BOTS, skipping bot start');
    return;
  }

  try {
    const nbuRateBot = container.get<NBURateBot>(NBURateBot);
    const nbuRateBotChartJob = container.get<NBURateBotChartJob>(NBURateBotChartJob);
    const nbuRateBotDailyExchangesJob = container.get<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob);

    nbuRateBot.botStart();
    nbuRateBotChartJob.start();
    nbuRateBotDailyExchangesJob.start();

    logger.info('NBU Rate bot and its cron jobs started');
  } catch (error) {
    logger.error('Failed to start NBU bot or cron jobs', error);
    throw error;
  }
}

function startReactClickerBot(logger: Logger): void {
  if (!featureFlags.reactClickerEnabled) {
    logger.info('React Clicker bot disabled via ENABLED_BOTS, skipping bot start');
    return;
  }

  try {
    const reactClickerBot = container.get<ReactClickerBot>(ReactClickerBot);
    reactClickerBot.botStart();
    logger.info('React Clicker bot started');
  } catch (error) {
    logger.error('Failed to start React Clicker bot', error);
    throw error;
  }
}

async function bootstrap(): Promise<void> {
  const logger = container.get<Logger>(LoggerToken.$);

  try {
    await startExpress(logger);
    startNbuBot(logger);
    startReactClickerBot(logger);
  } catch (error) {
    logger.error('Combined process bootstrap failed', error);
    process.exit(1);
  }
}

void bootstrap();
