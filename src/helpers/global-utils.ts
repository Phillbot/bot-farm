import { injectable } from 'inversify';
import { Cat, Random } from 'some-random-cat';

import { Logger } from './logger';

export type CatType = {
  id: string;
  url: string;
  width: number;
  height: number;
};

@injectable()
export class GlobalUtils {
  constructor(private readonly _logger: Logger) {}

  public pickKeysFromIterable<T>(obj: T, keys: (keyof T)[]): { [k: string]: T[keyof T] } {
    return Object.fromEntries(keys.map((k) => [k, obj[k]]));
  }

  public getRandomCat = async (): Promise<Cat | undefined | null> => {
    return await Random.getCat()
      .then((res) => res)
      .catch((e) => {
        this._logger.error(e);
        return undefined;
      });
  };

  public isNotNull(v: unknown): boolean {
    return typeof v !== 'undefined' && v !== null;
  }

  public greaterThen0(n: number): boolean {
    return this.isNotNull(n) && n > 0;
  }

  public isArrayNotEmpty(array: unknown[]): boolean {
    return typeof array !== 'undefined' && array !== null && Array.isArray(array) && array.length > 0;
  }

  public isArrayEmpty(array: unknown[]): boolean {
    return typeof array === 'undefined' || array === null || (Array.isArray(array) && array.length === 0);
  }

  public isString(value: unknown): boolean {
    return typeof value === 'string';
  }

  public isNumber(value: unknown): boolean {
    return typeof value === 'number';
  }

  public isBoolean(value: unknown): boolean {
    return typeof value === 'boolean';
  }

  public isObject(value: unknown): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  public isFunction(value: unknown): boolean {
    return typeof value === 'function';
  }

  public isEmptyObject(obj: object): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}
