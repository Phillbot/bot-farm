import { Abilities, AbilitiesMapping } from '@database/react-clicker-bot/types';

export function mapAbilities(abilities: Abilities | undefined): AbilitiesMapping | undefined {
  if (!abilities) {
    return undefined;
  }

  return {
    clickCostLevel: abilities.click_coast_level,
    energyLevel: abilities.energy_level,
    energyRegenLevel: abilities.energy_regeniration_level,
  };
}
