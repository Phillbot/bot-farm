import { User } from '@database/react-clicker-bot/react-clicker-bot.models';
import { UserMapping } from '@database/react-clicker-bot/types';

export function mapReferralUser(referrals: User[]): UserMapping[] {
  return referrals.map((referral) => ({
    userId: referral.user_id,
    regData: referral.reg_data,
    userName: referral.user_name ?? null,
    firstName: referral.first_name ?? null,
    userStatus: referral.user_status,
    balance: referral.balance as number,
    referralId: referral.referral_id ?? null,
  }));
}
