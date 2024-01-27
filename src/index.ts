import 'dotenv/config';

import { expressServer } from './server';
import { nbuRateBot } from './telegram';

/**
 * Here we start server
 * we need server instance for bot host
 * also we can use it for cron, logs etc
 */

expressServer.listen();

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
  ]);

  await nbuRateBot.start({
    onStart: (bot) => {
      // eslint-disable-next-line
      console.table({ bot_name: 'nbuRateBot', ...bot });
    },
    drop_pending_updates: true,
  });
})();
