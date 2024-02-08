import { Bot, Context } from 'grammy';
import { EmojiFlavor, emojiParser } from '@grammyjs/emoji';

import { dailyExchanges } from './cron-jobs/daily-exhanges.job';
import { nbuRate, nbuStart, nbuSubscribe } from './commands';
import { nbuUnsubscribe } from './commands/nbu-unsubscribe.command';

export type NBUCurrencyContext = EmojiFlavor<Context>;

export const nbuRateBot = new Bot<NBUCurrencyContext>(
  process.env.NBU_RATE_BOT_TOKEN as string,
);

// usages
nbuRateBot.use(emojiParser());

// commands
nbuRateBot.command('start', nbuStart);
nbuRateBot.command('subscribe', nbuSubscribe);
nbuRateBot.command('unsubscribe', nbuUnsubscribe);

nbuRateBot.command(['rate', 'rate_main'], nbuRate);

// common
nbuRateBot.on('message', () => {
  // here we can track all incoming message from private and groups (need admin) by ctx
});

// errors
// eslint-disable-next-line
nbuRateBot.catch((e) => console.log(e));

//cron-jobs
dailyExchanges.start();
