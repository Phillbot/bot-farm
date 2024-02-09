import { CommandContext } from 'grammy';

import { botSubscribers } from '@database/postgresql/models/bot-subscribers.model';
import { TelegramUtils } from '@telegram/telegram-utils';

import { NBUCurrencyContext } from '../nbu-rate.bot';
import { nbuTexts } from '../helpers/nbu-texts';
import { NBUCurrencyRateUtils } from '../helpers/nbu-utils';

export const nbuStart = async (ctx: CommandContext<NBUCurrencyContext>) => {
  try {
    const user = await botSubscribers.findOne({
      where: { user_id: ctx.from?.id },
    });

    if (user?.dataValues) {
      await TelegramUtils.sendReply(
        ctx,
        nbuTexts['start'][TelegramUtils.getLang(ctx.from?.language_code)],
      );
      return;
    }

    await NBUCurrencyRateUtils.subscribeManager.createUser(ctx, 'start');
  } catch (error) {
    // TODO: logger
    // eslint-disable-next-line
    console.log('nbuStart', error);
  }
};
