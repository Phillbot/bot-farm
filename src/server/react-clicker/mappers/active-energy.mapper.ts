import { ActiveEnergyByUser, LastSession, UserAbility } from '@database/react-clicker-bot/react-clicker-bot.models';
import { ActiveEnergyMapping } from '@database/react-clicker-bot/types';

const ENERGY_REGEN_INTERVAL_MS = 100;
const ENERGY_REGEN_MULTIPLIER = 0.11;
const ENERGY_UNIT_SIZE = 1000;

export function mapActiveEnergy(
  activeEnergy: ActiveEnergyByUser | undefined,
  lastSession: LastSession | undefined,
  userAbility: UserAbility | undefined,
): ActiveEnergyMapping | undefined {
  if (!activeEnergy) {
    return undefined;
  }

  const baseEnergy = Number(activeEnergy.active_energy ?? 0);

  if (!userAbility || !lastSession?.last_login) {
    return { availablePoints: baseEnergy };
  }

  const regenTimeMs = Math.max(0, Date.now() - lastSession.last_login);
  const regenCycles = Math.floor(regenTimeMs / ENERGY_REGEN_INTERVAL_MS);
  const regenerated = regenCycles * userAbility.energy_regeniration_level * ENERGY_REGEN_MULTIPLIER;
  const maxEnergy = userAbility.energy_level * ENERGY_UNIT_SIZE;
  const availablePoints = Math.min(maxEnergy, baseEnergy + regenerated);

  return { availablePoints };
}
