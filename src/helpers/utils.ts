export function assertNever(value: never, noThrow: boolean = false): never {
  if (noThrow) {
    return value;
  }
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

export default assertNever;
