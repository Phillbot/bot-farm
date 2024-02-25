import { injectable } from 'inversify';
import { Random } from 'some-random-cat';

@injectable()
export class GlobalUtils {
  public pickKeysFromIterable<T>(obj: T, keys: (keyof T)[]) {
    return Object.fromEntries(keys.map((k) => [k, obj[k]]));
  }

  public getRandomCatUrl = async () => {
    const { url } = await Random.getCat()
      .then((res) => res)
      .catch((e) => e);

    return url;
  };
}
