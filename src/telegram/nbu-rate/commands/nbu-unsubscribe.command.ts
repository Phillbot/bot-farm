import { inject, injectable } from 'inversify';
import { CommandContext } from 'grammy';

import { NBURateBotContext } from '../nbu-rate.bot';
import { NBUCurrencyBotUser } from '../../../database/nbu-rate-bot-user.entity';
import { NBURateBotUtils } from '../helpers/nbu-utils';

@injectable()
export class NBURateBotUnsubscribeCommand {
  constructor(
    @inject(NBUCurrencyBotUser) private _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(NBURateBotUtils)
    private _nbuRateBotUtils: NBURateBotUtils,
  ) {}

  public async withCtx(ctx: CommandContext<NBURateBotContext>) {
    if (!ctx.from?.id) {
      return;
    }

    const user = await this._nbuCurrencyBotUser.getUserById(ctx.from.id);

    const { createUser, unableToUpdateSubscribe, updateSubscribe } =
      this._nbuRateBotUtils.subscribeManager(ctx, ctx.from.id, 'unsubscribe');

    if (user?.dataValues) {
      const isUserSubscriber: boolean =
        await user?.dataValues.is_subscribe_active;

      if (isUserSubscriber) {
        await updateSubscribe();
        return;
      }

      await unableToUpdateSubscribe();
      return;
    }
    await createUser();
    return;
  }
}
