import { isTrue } from '../utils/env.utils';

export const featureFlags = {
  reactClickerEnabled: isTrue(process.env.REACT_CLICKER_FEATURE_ENABLED),
} as const;
