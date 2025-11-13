import { inject, injectable, optional } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { CronStatusRegistry } from '@helpers/cron-status.registry';
import { Logger } from '@helpers/logger';

import { NBURateBotPostgresqlSequelize } from '@database/nbu-rate-bot/nbu-rate-bot.db';
import { ReactClickerBotSequelize } from '@database/react-clicker-bot/react-clicker-bot.db';

import { DatabaseHealth, HealthSnapshot } from './health.types';

@injectable()
export class HealthService {
  constructor(
    @inject(LoggerToken.$)
    private readonly _logger: Logger,
    private readonly _cronStatusRegistry: CronStatusRegistry,
    @optional()
    private readonly _nbuRateBotDb?: NBURateBotPostgresqlSequelize,
    @optional()
    private readonly _reactClickerBotDb?: ReactClickerBotSequelize,
  ) { }

  public async getSnapshot(): Promise<HealthSnapshot> {
    const databaseChecks = [
      await this.checkDatabase('nbu', this._nbuRateBotDb),
      await this.checkDatabase('reactClicker', this._reactClickerBotDb),
    ];

    const hasErrors = databaseChecks.some((check) => check.status === 'error');

    return {
      status: hasErrors ? 'error' : 'ok',
      databases: databaseChecks,
      crons: this._cronStatusRegistry.getSnapshots(),
    };
  }

  private async checkDatabase(
    name: string,
    client?: { ping: () => Promise<void> } | null,
  ): Promise<DatabaseHealth> {
    if (!client) {
      return { name, status: 'skipped' };
    }

    try {
      await client.ping();
      return { name, status: 'ok' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this._logger.error(`${name} DB health check failed`, error);
      return { name, status: 'error', error: message };
    }
  }
}
