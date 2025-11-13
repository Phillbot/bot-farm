require('dotenv/config');
const { URL } = require('url');

const AVAILABLE_BOTS = Object.freeze({
  nbu: 'nbu',
  reactClicker: 'react_clicker',
});

const DEFAULT_ENABLED_BOTS = Object.freeze([AVAILABLE_BOTS.nbu]);

function isBotIdentifier(value) {
  return Object.values(AVAILABLE_BOTS).includes(value);
}

function parseEnabledBots(rawValue) {
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

  return uniqueIdentifiers;
}

function normalizeUrl(connectionUrl, explicitPort) {
  if (!connectionUrl) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(connectionUrl);

    if (explicitPort && parsedUrl.port !== explicitPort) {
      parsedUrl.port = explicitPort;
    }

    parsedUrl.searchParams.delete('sslmode');

    return parsedUrl.toString();
  } catch (error) {
    throw new Error(`Invalid database URL provided to Sequelize CLI: ${error.message}`);
  }
}

function buildConfig(connectionUrl, explicitPort) {
  const normalizedUrl = normalizeUrl(connectionUrl, explicitPort);

  if (!normalizedUrl) {
    return undefined;
  }

  return {
    url: normalizedUrl,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    migrationStorageTableName: 'SequelizeMeta',
  };
}

const enabledBots = parseEnabledBots(process.env.ENABLED_BOTS);
const configurations = {};

if (enabledBots.includes(AVAILABLE_BOTS.nbu)) {
  const nbuConfig = buildConfig(
    process.env.NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL,
    process.env.NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_PORT,
  );

  if (nbuConfig) {
    configurations.nbu = nbuConfig;
  }
}

if (enabledBots.includes(AVAILABLE_BOTS.reactClicker)) {
  const reactClickerConfig = buildConfig(process.env.REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL);

  if (reactClickerConfig) {
    configurations.reactClicker = reactClickerConfig;
  }
}

if (Object.keys(configurations).length === 0) {
  throw new Error('No database configuration available for Sequelize CLI. Check your environment variables.');
}

module.exports = configurations;
