const TRUE_VALUES = new Set(['true', '1', 'yes', 'y', 'on']);
const FALSE_VALUES = new Set(['false', '0', 'no', 'n', 'off']);

export function isSomething<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isTrue(value?: string | null): boolean {
  if (!isSomething(value)) {
    return false;
  }

  return TRUE_VALUES.has(value.trim().toLowerCase());
}

export function toBoolean(value: string | null | undefined, fallback = false): boolean {
  if (!isSomething(value)) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return fallback;
}
