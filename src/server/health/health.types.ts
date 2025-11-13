import { CronStatusSnapshot } from '@helpers/cron-status.registry';

export type HealthStatus = 'ok' | 'error' | 'skipped';

export type DatabaseHealth = {
  name: string;
  status: HealthStatus;
  error?: string;
};

export type HealthSnapshot = {
  status: 'ok' | 'error';
  databases: DatabaseHealth[];
  crons: CronStatusSnapshot[];
};
