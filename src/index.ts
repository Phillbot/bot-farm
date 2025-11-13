import 'dotenv/config';
import 'reflect-metadata';

import { container } from '@config/inversify.config';
import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { ExpressApp } from './server';

const logger = container.get<Logger>(LoggerToken.$);

async function bootstrap(): Promise<void> {
  const server = container.get<ExpressApp>(ExpressApp);
  await server.start();
}

bootstrap().catch((error) => {
  logger.error('Express bootstrap failed', error);
  process.exit(1);
});
