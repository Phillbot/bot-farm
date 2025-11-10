require('dotenv/config');
const { URL } = require('url');

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

const configurations = {};

const nbuConfig = buildConfig(
  process.env.NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL,
  process.env.NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_PORT,
);

if (nbuConfig) {
  configurations.nbu = nbuConfig;
}

const reactClickerConfig = buildConfig(process.env.REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL);

if (reactClickerConfig) {
  configurations.reactClicker = reactClickerConfig;
}

if (Object.keys(configurations).length === 0) {
  throw new Error('No database configuration available for Sequelize CLI. Check your environment variables.');
}

module.exports = configurations;
