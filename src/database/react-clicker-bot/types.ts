import { ActiveEnergyByUser, Boost, LastSession, Referral, UserAbility } from './react-clicker-bot.models';

export type ExtendedUser = {
  user_id: number;
  reg_data: number;
  referral_id?: number;
  user_name?: string;
  first_name?: string;
  user_status: number;
  balance: number;
  abilities?: UserAbility;
  referrals: Referral[];
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

export const ClickCostLevelMax = 20;
export const EnergyValueLevelMax = 10;
export const EnergyRegenLevelMax = 5;

const clickCoefficient = 1;
const evergyCoefficient = 1000;
const evergyRegenCoefficient = 0.1;

export function getClickCostByLevel(level: ClickCostLevel): number {
  return level * clickCoefficient;
}

export function getEnergyValueByLevel(level: EnergyValueLevel): number {
  return level * evergyCoefficient;
}

export function getEnergyRegenValueByLevel(level: EnergyRegenLevel): number {
  return level * evergyRegenCoefficient;
}

export const clickCostUpdateLevelCost = new Map<ClickCostLevel, number>([
  [ClickCostLevel.LEVEL_1, 0],
  [ClickCostLevel.LEVEL_2, 1000],
  [ClickCostLevel.LEVEL_3, 2000],
  [ClickCostLevel.LEVEL_4, 4000],
  [ClickCostLevel.LEVEL_5, 8000],
  [ClickCostLevel.LEVEL_6, 12500],
  [ClickCostLevel.LEVEL_7, 15000],
  [ClickCostLevel.LEVEL_8, 17500],
  [ClickCostLevel.LEVEL_9, 20000],
  [ClickCostLevel.LEVEL_10, 30000],
  [ClickCostLevel.LEVEL_11, 50000],
  [ClickCostLevel.LEVEL_12, 10000],
  [ClickCostLevel.LEVEL_13, 125000],
  [ClickCostLevel.LEVEL_14, 150000],
  [ClickCostLevel.LEVEL_15, 175000],
  [ClickCostLevel.LEVEL_16, 200000],
  [ClickCostLevel.LEVEL_17, 350000],
  [ClickCostLevel.LEVEL_18, 500000],
  [ClickCostLevel.LEVEL_19, 750000],
  [ClickCostLevel.LEVEL_20, 1000000],
]);

export const energyValueUpdateLevelCost = new Map<EnergyValueLevel, number>([
  [EnergyValueLevel.LEVEL_1, 0],
  [EnergyValueLevel.LEVEL_2, 5000],
  [EnergyValueLevel.LEVEL_3, 10000],
  [EnergyValueLevel.LEVEL_4, 15000],
  [EnergyValueLevel.LEVEL_5, 20000],
  [EnergyValueLevel.LEVEL_6, 25000],
  [EnergyValueLevel.LEVEL_7, 50000],
  [EnergyValueLevel.LEVEL_8, 75000],
  [EnergyValueLevel.LEVEL_9, 100000],
  [EnergyValueLevel.LEVEL_10, 125000],
]);

export const energyRegenValueUpdateLevelCost = new Map<EnergyRegenLevel, number>([
  [EnergyRegenLevel.LEVEL_1, 0],
  [EnergyRegenLevel.LEVEL_2, 15000],
  [EnergyRegenLevel.LEVEL_3, 20000],
  [EnergyRegenLevel.LEVEL_4, 25000],
  [EnergyRegenLevel.LEVEL_5, 50000],
]);
