import { inject, injectable } from 'inversify';
import { CommandContext } from 'grammy';

import { NBURateBotContext } from '../nbu-rate.bot';
import { NBURateBotUtils } from '../nbu-rate.utils';

@injectable()
export class NBURateBotSubscribeCommand {
  constructor(
    @inject(NBURateBotUtils)
    private _nbuRateBotUtils: NBURateBotUtils,
  ) {}

  public async withCtx(ctx: CommandContext<NBURateBotContext>) {
    if (!ctx.from?.id) {
      return;
    }

    const { createUser, unableToUpdateSubscribe, updateSubscribe } =
      this._nbuRateBotUtils.subscribeManager(ctx, ctx.from.id, 'subscribe');

    if (!ctx?.dataValues) {
      await createUser();
      return;
    }

    const isUserSubscriber: boolean = await ctx?.dataValues.is_subscribe_active;

    if (isUserSubscriber) {
      await unableToUpdateSubscribe();
      return;
    }

    await updateSubscribe();
  }
}
