import { CommandContext } from 'grammy';

import { botSubscribers } from '@database/postgresql/models/bot-subscribers.model';

import { NBUCurrencyContext } from '../nbu-rate.bot';
import { NBUCurrencyRateUtils } from '../helpers/nbu-utils';

export const nbuSubscribe = async (ctx: CommandContext<NBUCurrencyContext>) => {
  try {
    const user = await botSubscribers.findOne({
      where: { user_id: ctx.from?.id },
    });

    if (!user?.dataValues) {
      await NBUCurrencyRateUtils.subscribeManager.createUser(ctx, 'subscribe');
      return;
    }

    const isUserSubscriber: boolean =
      await user?.dataValues.is_subscribe_active;

    if (isUserSubscriber) {
      await NBUCurrencyRateUtils.subscribeManager.unableToUpdateSubscribe(
        ctx,
        'subscribe',
      );
      return;
    }

    await NBUCurrencyRateUtils.subscribeManager.updateSubscribe(
      ctx,
      'subscribe',
    );
  } catch (error) {
    // TODO: logger
    // eslint-disable-next-line
    console.log('nbuSubscribe', error);
  }
};
