import 'dotenv/config';
import 'reflect-metadata';

import { featureFlags } from '@config/feature-flags';
import { container } from '@config/inversify.config';
import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { ReactClickerBot } from '@telegram';

async function bootstrap(): Promise<void> {
  const logger = container.get<Logger>(LoggerToken.$);

  if (!featureFlags.reactClickerEnabled) {
    logger.warn('React Clicker bot is disabled via ENABLED_BOTS. Skipping bot bootstrap.');
    return;
  }

  try {
    const reactClickerBot = container.get<ReactClickerBot>(ReactClickerBot);
    reactClickerBot.botStart();
    logger.info('React Clicker bot started successfully');
  } catch (error) {
    logger.error('Failed to bootstrap React Clicker bot process:', error);
    process.exit(1);
  }
}

bootstrap();
