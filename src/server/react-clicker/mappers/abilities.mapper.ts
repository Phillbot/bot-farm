import { Abilities, AbilitiesMapping } from '@database/react-clicker-bot/types';

export function mapAbilitiesToCamelCase(abilities: Abilities | undefined): AbilitiesMapping | undefined {
  if (!abilities) return undefined;

  return {
    clickCoastLevel: abilities?.click_coast_level,
    energyLevel: abilities?.energy_level,
    energyRegenirationLevel: abilities?.energy_regeniration_level,
  };
}
