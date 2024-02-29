import { injectable } from 'inversify';
import { Random } from 'some-random-cat';

export type CatType = {
  id: string;
  url: string;
  width: number;
  height: number;
};

@injectable()
export class GlobalUtils {
  public pickKeysFromIterable<T>(obj: T, keys: (keyof T)[]): { [k: string]: T[keyof T] } {
    return Object.fromEntries(keys.map((k) => [k, obj[k]]));
  }

  public getRandomCat = async (): Promise<CatType> => {
    return await Random.getCat()
      .then((res) => res)
      .catch((e) => e); // cat logs?
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
}
