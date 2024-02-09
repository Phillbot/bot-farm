import { Bot, Context } from 'grammy';
import { inject, injectable } from 'inversify';

import { EmojiFlavor, emojiParser } from '@grammyjs/emoji';
import {
  NBURateBotRateCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from './commands';
import { COMMANDS, COMMANDS_DESCRIPTORS } from './helpers/types';

// import { chart, dailyExchanges } from './cron-jobs';

export type NBURateBotContext = EmojiFlavor<Context>;

@injectable()
export class NBURateBot {
  private readonly _bot = new Bot<NBURateBotContext>(
    process.env.NBU_RATE_BOT_TOKEN as string,
  );

  constructor(
    @inject(NBURateBotStartCommand)
    private readonly _nbuRateBotStartCommand: NBURateBotStartCommand,
    @inject(NBURateBotRateCommand)
    private _nbuRateBotRateCommand: NBURateBotRateCommand,
    @inject(NBURateBotSubscribeCommand)
    private _nbuRateBotSubscribeCommand: NBURateBotSubscribeCommand,
    @inject(NBURateBotUnsubscribeCommand)
    private _nbuRateBotUnsubscribeCommand: NBURateBotUnsubscribeCommand,
  ) {
    this._bot.use(emojiParser());

    this.init();

    this.commands();

    // keep it on bottom - its will work if there was any omission before
    this._bot.on('message', () => {
      // here we can track all incoming message from private and groups (need admin) by ctx
    });

    // errors
    // eslint-disable-next-line
    this._bot.catch((e) => console.log(e));
  }

  private commands() {
    this._bot.command(COMMANDS.START, (ctx) =>
      this._nbuRateBotStartCommand.withCtx(ctx),
    );

    this._bot.command([COMMANDS.RATE, COMMANDS.RATE_MAIN], (ctx) =>
      this._nbuRateBotRateCommand.withCtx(ctx),
    );

    this._bot.command(COMMANDS.SUBSCRIBE, (ctx) =>
      this._nbuRateBotSubscribeCommand.withCtx(ctx),
    );

    this._bot.command(COMMANDS.UNSUBSCRIBE, (ctx) =>
      this._nbuRateBotUnsubscribeCommand.withCtx(ctx),
    );
  }

  private async init() {
    await this._bot.api.setMyCommands([
      {
        command: COMMANDS.RATE,
        description: COMMANDS_DESCRIPTORS.RATE,
      },
      {
        command: COMMANDS.RATE_MAIN,
        description: COMMANDS_DESCRIPTORS.RATE_MAIN,
      },
      {
        command: COMMANDS.SUBSCRIBE,
        description: COMMANDS_DESCRIPTORS.SUBSCRIBE,
      },
      {
        command: COMMANDS.UNSUBSCRIBE,
        description: COMMANDS_DESCRIPTORS.UNSUBSCRIBE,
      },
      { command: COMMANDS.START, description: COMMANDS_DESCRIPTORS.START },
    ]);

    await this._bot.start({
      onStart: (bot) => {
        // eslint-disable-next-line
        console.table({ bot_name: NBURateBot.name, ...bot });
      },
      drop_pending_updates: true,
    });
  }

  public get bot() {
    return this._bot;
  }
}
