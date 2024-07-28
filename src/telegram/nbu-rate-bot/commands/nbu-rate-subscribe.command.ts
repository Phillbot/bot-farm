import { inject, injectable } from 'inversify';
import { CommandContext } from 'grammy';

import { COMMANDS, NBURateBotContext, NBURateBotUtils } from '../nbu-rate.utils';

@injectable()
export class NBURateBotSubscribeCommand {
  constructor(@inject(NBURateBotUtils) private _nbuRateBotUtils: NBURateBotUtils) {}

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    if (!ctx.from?.id) {
      return;
    }

    const { createUser, unableToUpdateSubscribe, updateSubscribe } = this._nbuRateBotUtils.subscribeManager(
      ctx,
      ctx.from.id,
      COMMANDS.SUBSCRIBE,
    );

    if (!ctx?.dataValues) {
      await createUser();
      return;
    }

    const isUserSubscriber = await ctx?.dataValues.is_subscribe_active;

    if (isUserSubscriber) {
      await unableToUpdateSubscribe();
      return;
    }

    await updateSubscribe();
  }
}
