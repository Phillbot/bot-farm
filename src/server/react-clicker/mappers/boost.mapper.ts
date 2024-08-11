import { Boost } from '@database/react-clicker-bot/react-clicker-bot.models';
import { BoostMapping } from '@database/react-clicker-bot/types';

export function mapBoost(boost: Boost | undefined): BoostMapping | undefined {
  if (!boost) return undefined;

  return {
    lastBoostRun: boost?.last_boost_run,
  };
}
