import { container } from '@config/inversify.config';
import { ExtendedUser, UserResponseData } from '@database/react-clicker-bot/types';
import { ReactClickerBot } from '@telegram/index';
import { User } from 'grammy/types';

import { mapBot } from './mappers/bot.mapper';
import { mapAbilitiesToCamelCase } from './mappers/abilities.mapper';
import { mapActiveEnergy } from './mappers/active-energy.mapper';
import { mapReferralUser } from './mappers/referrals.mapper';
import { mapBoost } from './mappers/boost.mapper';
import { mapTelegramUser } from './mappers/telegram-user.mapper';

export async function createUserResponseData(telegramUser: User, userData: ExtendedUser): Promise<UserResponseData> {
  const reactClickerBot = container.get<ReactClickerBot>(ReactClickerBot);

  return {
    ok: true,
    bot: mapBot(reactClickerBot.bot.botInfo),
    user: {
      ...mapTelegramUser(telegramUser),
      balance: userData.balance,
      status: userData.user_status,
      referralId: userData.referral_id,
      lastLogout: userData.lastSession?.last_logout,
      abilities: mapAbilitiesToCamelCase(userData.abilities),
      activeEnergy: mapActiveEnergy(userData.activeEnergy),
      referrals: mapReferralUser(userData.referrals),
      boost: mapBoost(userData.boost),
    },
  };
}
