import 'dotenv/config';

import { expressServer } from './server';
import { postgresqlSequelize } from './database';
import { nbuRateBot } from './telegram';

/**
 * Here we start server
 * we need server instance for bot host
 * also we can use it for cron, logs etc
 */

expressServer.listen();

/**
 * Here we put databases connectors
 */

(async () => {
  await postgresqlSequelize
    .authenticate()
    .then(() =>
      // eslint-disable-next-line
      console.table({ database: 'postgresqlSequelize', status: 'ok' }),
    )
    // eslint-disable-next-line
    .catch((error) => console.error(error));
})();

/**
 * Here we start bot
 * we can start any bots below
 */

(async () => {
  await nbuRateBot.api.setMyCommands([
    {
      command: 'rate',
      description: 'Show NBU exchanges. All or by currencies',
    },
    { command: 'rate_main', description: 'Show NBU USD and EUR exchanges' },
    {
      command: 'subscribe',
      description: 'Will send exchange to user automatically 2 times per day',
    },
    { command: 'unsubscribe', description: 'Remove subscribe' },
  ]);

  await nbuRateBot.start({
    onStart: (bot) => {
      // eslint-disable-next-line
      console.table({ bot_name: 'nbuRateBot', ...bot });
    },
    drop_pending_updates: true,
  });
})();
