import { LOG_LEVEL } from '@helpers/logger';
import { isSomething, isTrue } from '../utils/env.utils';

type Nullable<T> = T | null | undefined;

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function getRequiredEnv(key: string): string {
  const value = getEnv(key);

  if (!value) {
    throw new Error(`Environment variable "${key}" is required but was not provided.`);
  }

  return value;
}

function getRequiredNumberEnv(key: string): number {
  const rawValue = getRequiredEnv(key);
  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable "${key}" must be a valid number. Received "${rawValue}".`);
  }

  return parsedValue;
}

function getOptionalNumberEnv(key: string): number | undefined {
  const rawValue = getEnv(key);

  if (!isSomething(rawValue)) {
    return undefined;
  }

  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable "${key}" must be a valid number. Received "${rawValue}".`);
  }

  return parsedValue;
}

function ensureReactClickerConfig<T extends Record<string, Nullable<string>>>(
  config: T,
  requiredKeys: Array<keyof T>,
) {
  for (const key of requiredKeys) {
    if (!isSomething(config[key])) {
      throw new Error(`Environment variable "${String(key)}" is required when the React Clicker feature is enabled.`);
    }
  }
}

const reactClickerEnabled = isTrue(getEnv('REACT_CLICKER_FEATURE_ENABLED'));

const reactClickerConfig = {
  REACT_CLICKER_APP_BOT_TOKEN: reactClickerEnabled ? getEnv('REACT_CLICKER_APP_BOT_TOKEN') : undefined,
  REACT_CLICKER_APP_SESSION_DURATION_S: reactClickerEnabled ? getEnv('REACT_CLICKER_APP_SESSION_DURATION_S') : undefined,
  REACT_CLICKER_APP_GAME_URL: reactClickerEnabled ? getEnv('REACT_CLICKER_APP_GAME_URL') : undefined,
  REACT_CLICKER_APP_BOT_TIME_ZONE: reactClickerEnabled ? getEnv('REACT_CLICKER_APP_BOT_TIME_ZONE') : undefined,
  REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL: reactClickerEnabled
    ? getEnv('REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL')
    : undefined,
  REACT_CLICKER_APP_SALT: reactClickerEnabled ? getEnv('REACT_CLICKER_APP_SALT') : undefined,
} as const;

if (reactClickerEnabled) {
  ensureReactClickerConfig(reactClickerConfig, [
    'REACT_CLICKER_APP_BOT_TOKEN',
    'REACT_CLICKER_APP_SESSION_DURATION_S',
    'REACT_CLICKER_APP_GAME_URL',
    'REACT_CLICKER_APP_BOT_TIME_ZONE',
    'REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL',
    'REACT_CLICKER_APP_SALT',
  ]);
}

export const environment = {
  app: {
    env: getRequiredEnv('ENV'),
    logLevel: getRequiredEnv('LOG_LEVEL') as LOG_LEVEL,
    port: getRequiredNumberEnv('PORT'),
    contactUrl: getRequiredEnv('CONTACT_URL'),
  },
  nbu: {
    botToken: getRequiredEnv('NBU_RATE_EXCHANGE_BOT_TOKEN'),
    postgresUrl: getRequiredEnv('NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL'),
    postgresPort: getOptionalNumberEnv('NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_PORT'),
    apiUrl: getRequiredEnv('NBU_RATE_EXCHANGE_API_URL'),
    apiUrlByDate: getRequiredEnv('NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL'),
    webLink: getRequiredEnv('NBU_RATE_EXCHANGE_WEB_LINK'),
    currencies: getRequiredEnv('NBU_RATE_EXCHANGE_CURRENCIES'),
    cronTableSchema: getRequiredEnv('NBU_RATE_EXCHANGE_CURRENCY_TABLE_CRON_SCHEMA'),
    cronChartSchema: getRequiredEnv('NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA'),
    cronTimezone: getRequiredEnv('NBU_RATE_EXCHANGE_CRON_TIMEZONE'),
  },
  reactClicker: {
    botToken: reactClickerConfig.REACT_CLICKER_APP_BOT_TOKEN,
    sessionDurationSeconds: reactClickerConfig.REACT_CLICKER_APP_SESSION_DURATION_S,
    gameUrl: reactClickerConfig.REACT_CLICKER_APP_GAME_URL,
    botTimezone: reactClickerConfig.REACT_CLICKER_APP_BOT_TIME_ZONE,
    postgresUrl: reactClickerConfig.REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL,
    salt: reactClickerConfig.REACT_CLICKER_APP_SALT,
  },
  features: {
    reactClickerEnabled,
  },
} as const;

export type Environment = typeof environment;

type ReactClickerConfig = typeof environment.reactClicker;

type EnabledReactClickerConfig = {
  [Key in keyof ReactClickerConfig]-?: NonNullable<ReactClickerConfig[Key]>;
};

export function getReactClickerConfigOrThrow(): EnabledReactClickerConfig {
  if (!environment.features.reactClickerEnabled) {
    throw new Error('React Clicker feature is disabled, configuration is not available.');
  }

  const { reactClicker } = environment;
  const missingEntries = Object.entries(reactClicker).filter(([, value]) => !isSomething(value));

  if (missingEntries.length > 0) {
    const missingKeys = missingEntries.map(([key]) => key).join(', ');
    throw new Error(`React Clicker configuration is incomplete. Missing values for: ${missingKeys}`);
  }

  return reactClicker as EnabledReactClickerConfig;
}
