import { inject, injectable } from 'inversify';
import { CommandContext } from 'grammy';

import { NBURateBotContext } from '../nbu-rate.bot';
import { NBURateBotUtils } from '../nbu-rate.utils';

@injectable()
export class NBURateBotUnsubscribeCommand {
  constructor(
    @inject(NBURateBotUtils)
    private _nbuRateBotUtils: NBURateBotUtils,
  ) {}

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    if (!ctx.from?.id) {
      return;
    }

    const { createUser, unableToUpdateSubscribe, updateSubscribe } =
      this._nbuRateBotUtils.subscribeManager(ctx, ctx.from.id, 'unsubscribe');

    if (ctx?.dataValues) {
      const isUserSubscriber = await ctx?.dataValues.is_subscribe_active;

      if (isUserSubscriber) {
        await updateSubscribe();
        return;
      }

      await unableToUpdateSubscribe();
      return;
    }

    await createUser();
  }
}
