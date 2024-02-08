import { CommandContext } from 'grammy';

import { botSubscribers } from '@database/postgresql/models/bot-subscribers.model';

import { NBUCurrencyContext } from '../nbu-rate.bot';
import { NBUCurrencyRateUtils } from '../nbu-utils';

export const nbuUnsubscribe = async (
  ctx: CommandContext<NBUCurrencyContext>,
) => {
  try {
    const user = await botSubscribers.findOne({
      where: { user_id: ctx.from?.id },
    });

    if (user?.dataValues) {
      const isUserSubscriber: boolean =
        await user?.dataValues.is_subscribe_active;

      if (isUserSubscriber) {
        await NBUCurrencyRateUtils.subscribeManager.updateSubscribe(
          ctx,
          'unsubscribe',
        );
        return;
      }

      await NBUCurrencyRateUtils.subscribeManager.unableToUpdateSubscribe(
        ctx,
        'unsubscribe',
      );
    }

    await NBUCurrencyRateUtils.subscribeManager.createUser(ctx, 'unsubscribe');
    return;
  } catch (error) {
    // TODO: logger
    // eslint-disable-next-line
    console.log('nbuUnsubscribe', error);
  }
};
