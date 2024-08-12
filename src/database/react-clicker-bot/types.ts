import { mapBot } from '@server/react-clicker/mappers/bot.mapper';
import { CreationOptional } from 'sequelize';

import { ActiveEnergyByUser, Boost, LastSession, UserAbility } from './react-clicker-bot.models';

export enum UserStatus {
  ACTIVE = 1,
  BANNED = 2,
  BLOCKED = 3,
}

export type ReferralUser = {
  reward_claim: boolean | undefined;
  user_id: number;
  reg_data: number;
  referral_id?: number | undefined;
  user_name?: string | undefined;
  first_name?: string | undefined;
  user_status: number;
  balance: CreationOptional<number>;
};

export type ExtendedUser = {
  user_id: number;
  reg_data: number;
  referral_id?: number;
  user_name?: string;
  first_name?: string;
  user_status: number;
  balance: number;
  abilities?: UserAbility;
  referrals: ReferralUser[];
  activeEnergy?: ActiveEnergyByUser;
  lastSession?: LastSession;
  boost?: Boost;
};

export enum AbilityType {
  ClickCost,
  EnergyLimit,
  EnergyRegen,
}

export interface Abilities {
  click_coast_level: ClickCostLevel;
  energy_level: EnergyValueLevel;
  energy_regeniration_level: EnergyRegenLevel;
}
export enum ClickCostLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
  LEVEL_6 = 6,
  LEVEL_7 = 7,
  LEVEL_8 = 8,
  LEVEL_9 = 9,
  LEVEL_10 = 10,
  LEVEL_11 = 11,
  LEVEL_12 = 12,
  LEVEL_13 = 13,
  LEVEL_14 = 14,
  LEVEL_15 = 15,
  LEVEL_16 = 16,
  LEVEL_17 = 17,
  LEVEL_18 = 18,
  LEVEL_19 = 19,
  LEVEL_20 = 20,
}

export enum EnergyValueLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
  LEVEL_6 = 6,
  LEVEL_7 = 7,
  LEVEL_8 = 8,
  LEVEL_9 = 9,
  LEVEL_10 = 10,
}

export enum EnergyRegenLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

export function getClickCostUpgradeCost(level: number): number {
  const costMap = new Map<number, number>([
    [1, 1000],
    [2, 2000],
    [3, 4000],
    [4, 8000],
    [5, 12500],
    [6, 15000],
    [7, 17500],
    [8, 20000],
    [9, 30000],
    [10, 50000],
    [11, 100000],
    [12, 125000],
    [13, 150000],
    [14, 175000],
    [15, 200000],
    [16, 350000],
    [17, 500000],
    [18, 750000],
    [19, 1000000],
  ]);
  return costMap.get(level) || 0;
}

export function getEnergyLimitUpgradeCost(level: number): number {
  const costMap = new Map<number, number>([
    [1, 5000],
    [2, 10000],
    [3, 15000],
    [4, 20000],
    [5, 25000],
    [6, 50000],
    [7, 75000],
    [8, 100000],
    [9, 125000],
  ]);
  return costMap.get(level) || 0;
}

export function getEnergyRegenUpgradeCost(level: number): number {
  const costMap = new Map<number, number>([
    [1, 15000],
    [2, 20000],
    [3, 25000],
    [4, 50000],
  ]);
  return costMap.get(level) || 0;
}

export type AbilitiesMapping = {
  clickCoastLevel: number;
  energyLevel: number;
  energyRegenirationLevel: number;
};

export type ActiveEnergyMapping = {
  availablePoints: number;
};

export type BoostMapping = {
  lastBoostRun: number;
};

export type BotMapping = {
  canConnectToBusiness: boolean | undefined;
  canJoinGroups: boolean;
  canReadAllGroupMessages: boolean;
  firstName: string;
  id: number;
  isBot: boolean;
  supportsInlineQueries: boolean;
  username: string;
};

export type UserMapping = {
  userId: number;
  regData: number;
  userName: string | null;
  firstName: string | null;
  userStatus: number;
  balance: number;
  referralId: number | null;
};

export type ReferralUserMapping = {
  userId: number;
  regData: number;
  userName: string | null;
  firstName: string | null;
  userStatus: number;
  balance: number;
  referralId: number | null;
  rewardClaim: boolean | undefined;
};

export type UserResponseData = {
  ok: boolean;
  bot: ReturnType<typeof mapBot>;
  user: {
    id: number;
    isBot: boolean;
    firstName: string;
    lastName?: string;
    userName?: string;
    languageCode?: string;
    isPremium?: boolean;
    balance: number;
    status: number;
    referralId?: number;
    abilities: AbilitiesMapping | undefined;
    activeEnergy: ActiveEnergyMapping | undefined;
    lastLogout?: number;
    referrals: UserMapping[];
    boost: BoostMapping | undefined;
  };
};
