import { ActiveEnergyByUser } from '@database/react-clicker-bot/react-clicker-bot.models';
import { ActiveEnergyMapping } from '@database/react-clicker-bot/types';

export function mapActiveEnergy(activeEnergy: ActiveEnergyByUser | undefined): ActiveEnergyMapping | undefined {
  if (!activeEnergy) return undefined;

  return {
    availablePoints: activeEnergy?.active_energy,
  };
}
