import { CommandContext } from 'grammy';

import { botSubscribers } from '@database/postgresql/models/bot-subscribers.model';
import { TelegramUtils } from '@telegram/telegram-utils';

import { NBUCurrencyContext } from '../nbu-rate.bot';
import { nbuTexts } from '../nbu-texts';

export const nbuSubscribe = async (ctx: CommandContext<NBUCurrencyContext>) => {
  const isUnsubscribe = ctx.message?.text.includes('/unsubscribe') || false;

  const user = await botSubscribers.findOne({
    where: {
      user_id: ctx.from?.id,
    },
  });

  // TODO: rework ?
  // TODO: i18 for messages

  if (user?.dataValues) {
    if (isUnsubscribe) {
      if (user?.dataValues.is_subscribe_active) {
        await botSubscribers.update(
          {
            is_subscribe_active: false,
          },
          {
            where: {
              user_id: ctx.from?.id,
            },
          },
        );

        await TelegramUtils.sendReply<NBUCurrencyContext>(
          ctx,
          nbuTexts['subscribe deactivated']['en'],
        );
      } else {
        await TelegramUtils.sendReply<NBUCurrencyContext>(
          ctx,
          nbuTexts['subscribe not active']['en'],
        );
      }
    } else {
      if (user?.dataValues.is_subscribe_active) {
        await TelegramUtils.sendReply<NBUCurrencyContext>(
          ctx,
          nbuTexts['subscribe already active']['en'],
        );
      } else {
        await botSubscribers.update(
          {
            is_subscribe_active: true,
          },
          {
            where: {
              user_id: ctx.from?.id,
            },
          },
        );

        await TelegramUtils.sendReply<NBUCurrencyContext>(
          ctx,
          nbuTexts['subscribe activated']['en'],
        );
      }
    }
  } else {
    await botSubscribers.create({
      user_id: ctx.from?.id,
      user_name: ctx.from?.username,
      is_subscribe_active: !isUnsubscribe,
    });

    await TelegramUtils.sendReply<NBUCurrencyContext>(
      ctx,
      !isUnsubscribe
        ? nbuTexts['subscribe activated']['en']
        : nbuTexts['subscribe not active']['en'],
    );
  }
};
