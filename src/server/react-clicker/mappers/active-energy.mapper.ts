import { ActiveEnergyByUser, LastSession, UserAbility } from '@database/react-clicker-bot/react-clicker-bot.models';
import { ActiveEnergyMapping } from '@database/react-clicker-bot/types';

export function mapActiveEnergy(
  activeEnergy: ActiveEnergyByUser | undefined,
  lastSession: LastSession | undefined,
  userAbility: UserAbility | undefined,
): ActiveEnergyMapping | undefined {
  if (!activeEnergy) return undefined;

  if (userAbility) {
    if (!lastSession?.last_login) {
      return {
        availablePoints: activeEnergy?.active_energy,
      };
    }

    const regenTimeMS = Date.now() - lastSession.last_login;
    const regenCycles = Math.floor(regenTimeMS / 100);
    const regeneratedEnergy = regenCycles * userAbility.energy_regeniration_level * 0.11;

    const maxEnergy = userAbility.energy_level * 1000;
    const accumulativeEnergyValue = activeEnergy.active_energy + regeneratedEnergy;

    const energyValue = accumulativeEnergyValue > maxEnergy ? maxEnergy : accumulativeEnergyValue;

    return {
      availablePoints: energyValue,
    };
  }

  if (!lastSession?.last_logout) {
    return {
      availablePoints: activeEnergy?.active_energy,
    };
  }
}
