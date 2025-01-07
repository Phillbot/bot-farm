import { container } from '@config/inversify.config';
import { ExtendedUser, UserResponseData } from '@database/react-clicker-bot/types';
import { ReactClickerBot } from '@telegram';
import { User } from 'grammy/types';

import { mapBot } from './bot.mapper';
import { mapAbilitiesToCamelCase } from './abilities.mapper';
import { mapActiveEnergy } from './active-energy.mapper';
import { mapReferralUser } from './referrals.mapper';
import { mapBoost } from './boost.mapper';
import { mapTelegramUser } from './telegram-user.mapper';

export async function createUserResponseDataMapper(
  telegramUser: User,
  userData: ExtendedUser,
): Promise<UserResponseData> {
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
      activeEnergy: mapActiveEnergy(userData.activeEnergy, userData.lastSession, userData.abilities),
      referrals: mapReferralUser(userData.referrals),
      boost: mapBoost(userData.boost),
    },
  };
}
