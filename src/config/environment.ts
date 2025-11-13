import { LOG_LEVEL } from '@helpers/logger';

import { isSomething } from '../utils/env.utils';

type Nullable<T> = T | null | undefined;

export type RequestLimitConfig = {
  windowMs: number;
  max: number;
};

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

const AVAILABLE_BOTS = {
  nbu: 'nbu',
  reactClicker: 'react_clicker',
} as const;

type BotIdentifier = (typeof AVAILABLE_BOTS)[keyof typeof AVAILABLE_BOTS];

const DEFAULT_ENABLED_BOTS: BotIdentifier[] = [AVAILABLE_BOTS.nbu];

function isBotIdentifier(value: string): value is BotIdentifier {
  return Object.values(AVAILABLE_BOTS).includes(value as BotIdentifier);
}

function parseEnabledBots(rawValue: string | undefined): BotIdentifier[] {
  if (!rawValue) {
    return DEFAULT_ENABLED_BOTS;
  }

  const normalized = rawValue
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  if (normalized.length === 0) {
    return [];
  }

  const uniqueIdentifiers = Array.from(new Set(normalized));
  const invalidIdentifiers = uniqueIdentifiers.filter((identifier) => !isBotIdentifier(identifier));

  if (invalidIdentifiers.length > 0) {
    throw new Error(
      `Environment variable "ENABLED_BOTS" contains unknown bot identifiers: ${invalidIdentifiers.join(', ')}`,
    );
  }

  return uniqueIdentifiers as BotIdentifier[];
}

function ensureBotConfig<T extends Record<string, Nullable<unknown>>>(
  botDisplayName: string,
  config: T,
  requiredKeys: Array<keyof T>,
) {
  for (const key of requiredKeys) {
    if (!isSomething(config[key])) {
      throw new Error(`Environment variable "${String(key)}" is required when the ${botDisplayName} bot is enabled.`);
    }
  }
}

const enabledBots = parseEnabledBots(getEnv('ENABLED_BOTS'));
const nbuEnabled = enabledBots.includes(AVAILABLE_BOTS.nbu);
const reactClickerEnabled = enabledBots.includes(AVAILABLE_BOTS.reactClicker);

const nbuConfig = {
  NBU_RATE_EXCHANGE_BOT_TOKEN: nbuEnabled ? getEnv('NBU_RATE_EXCHANGE_BOT_TOKEN') : undefined,
  NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL: nbuEnabled
    ? getEnv('NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL')
    : undefined,
  NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_PORT: nbuEnabled
    ? getOptionalNumberEnv('NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_PORT')
    : undefined,
  NBU_RATE_EXCHANGE_API_URL: nbuEnabled ? getEnv('NBU_RATE_EXCHANGE_API_URL') : undefined,
  NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL: nbuEnabled
    ? getEnv('NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL')
    : undefined,
  NBU_RATE_EXCHANGE_WEB_LINK: nbuEnabled ? getEnv('NBU_RATE_EXCHANGE_WEB_LINK') : undefined,
  NBU_RATE_EXCHANGE_CURRENCIES: nbuEnabled ? getEnv('NBU_RATE_EXCHANGE_CURRENCIES') : undefined,
  NBU_RATE_EXCHANGE_CURRENCY_TABLE_CRON_SCHEMA: nbuEnabled
    ? getEnv('NBU_RATE_EXCHANGE_CURRENCY_TABLE_CRON_SCHEMA')
    : undefined,
  NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA: nbuEnabled ? getEnv('NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA') : undefined,
  NBU_RATE_EXCHANGE_CRON_TIMEZONE: nbuEnabled ? getEnv('NBU_RATE_EXCHANGE_CRON_TIMEZONE') : undefined,
} as const;

if (nbuEnabled) {
  ensureBotConfig('NBU Rate', nbuConfig, [
    'NBU_RATE_EXCHANGE_BOT_TOKEN',
    'NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL',
    'NBU_RATE_EXCHANGE_API_URL',
    'NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL',
    'NBU_RATE_EXCHANGE_WEB_LINK',
    'NBU_RATE_EXCHANGE_CURRENCIES',
    'NBU_RATE_EXCHANGE_CURRENCY_TABLE_CRON_SCHEMA',
    'NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA',
    'NBU_RATE_EXCHANGE_CRON_TIMEZONE',
  ]);
}

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
  ensureBotConfig('React Clicker', reactClickerConfig, [
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
    requestLimit: {
      windowMs: getOptionalNumberEnv('REQUEST_LIMIT_WINDOW_MS') ?? 60_000,
      max: getOptionalNumberEnv('REQUEST_LIMIT_MAX') ?? 100,
    },
  },
  nbu: {
    botToken: nbuConfig.NBU_RATE_EXCHANGE_BOT_TOKEN,
    postgresUrl: nbuConfig.NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL,
    postgresPort: nbuConfig.NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_PORT,
    apiUrl: nbuConfig.NBU_RATE_EXCHANGE_API_URL,
    apiUrlByDate: nbuConfig.NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL,
    webLink: nbuConfig.NBU_RATE_EXCHANGE_WEB_LINK,
    currencies: nbuConfig.NBU_RATE_EXCHANGE_CURRENCIES,
    cronTableSchema: nbuConfig.NBU_RATE_EXCHANGE_CURRENCY_TABLE_CRON_SCHEMA,
    cronChartSchema: nbuConfig.NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA,
    cronTimezone: nbuConfig.NBU_RATE_EXCHANGE_CRON_TIMEZONE,
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
    enabledBots,
    nbuEnabled,
    reactClickerEnabled,
  },
} as const;

export type Environment = typeof environment;

type NbuConfig = typeof environment.nbu;
type ReactClickerConfig = typeof environment.reactClicker;

type EnabledNbuConfig = {
  [Key in keyof NbuConfig]-?: NonNullable<NbuConfig[Key]>;
};

type EnabledReactClickerConfig = {
  [Key in keyof ReactClickerConfig]-?: NonNullable<ReactClickerConfig[Key]>;
};

export function getNbuConfigOrThrow(): EnabledNbuConfig {
  if (!environment.features.nbuEnabled) {
    throw new Error('NBU Rate bot is disabled via ENABLED_BOTS, configuration is not available.');
  }

  const { nbu } = environment;
  const missingEntries = Object.entries(nbu).filter(([, value]) => !isSomething(value));

  if (missingEntries.length > 0) {
    const missingKeys = missingEntries.map(([key]) => key).join(', ');
    throw new Error(`NBU Rate configuration is incomplete. Missing values for: ${missingKeys}`);
  }

  return nbu as EnabledNbuConfig;
}

export function getReactClickerConfigOrThrow(): EnabledReactClickerConfig {
  if (!environment.features.reactClickerEnabled) {
    throw new Error('React Clicker bot is disabled via ENABLED_BOTS, configuration is not available.');
  }

  const { reactClicker } = environment;
  const missingEntries = Object.entries(reactClicker).filter(([, value]) => !isSomething(value));

  if (missingEntries.length > 0) {
    const missingKeys = missingEntries.map(([key]) => key).join(', ');
    throw new Error(`React Clicker configuration is incomplete. Missing values for: ${missingKeys}`);
  }

  return reactClicker as EnabledReactClickerConfig;
}
