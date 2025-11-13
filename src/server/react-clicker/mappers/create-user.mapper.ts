import { User, UserFromGetMe } from 'grammy/types';

import { ExtendedUser, UserResponseData } from '@database/react-clicker-bot/types';

import { mapAbilities } from './abilities.mapper';
import { mapActiveEnergy } from './active-energy.mapper';
import { mapBoost } from './boost.mapper';
import { mapBot } from './bot.mapper';
import { mapReferrals } from './referrals.mapper';
import { mapTelegramUser } from './telegram-user.mapper';

export function createUserResponseDataMapper(
  telegramUser: User,
  userData: ExtendedUser,
  botInfo: UserFromGetMe,
): UserResponseData {
  return {
    ok: true,
    bot: mapBot(botInfo),
    user: {
      ...mapTelegramUser(telegramUser),
      balance: userData.balance,
      status: userData.user_status,
      referralId: userData.referral_id ?? undefined,
      lastLogout: userData.lastSession?.last_logout,
      abilities: mapAbilities(userData.abilities),
      activeEnergy: mapActiveEnergy(userData.activeEnergy, userData.lastSession, userData.abilities),
      referrals: mapReferrals(userData.referrals),
      boost: mapBoost(userData.boost),
    },
  };
}
