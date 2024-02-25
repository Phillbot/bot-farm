import { inject, injectable } from 'inversify';
import { Cell, PrettyTable } from 'prettytable.js';

import { GlobalUtils } from './global-utils';

export type PrettyTableHeaderKeysType<T> = Readonly<
  Map<Partial<keyof T>, string>
>;

type Header<T> = Readonly<{
  type: 'with-header';
  headerKeys: PrettyTableHeaderKeysType<T>;
}>;

type Fields<T> = Readonly<{
  type: 'without-header';
  fields: Partial<keyof T>[];
}>;

type TableBuilderType<T> = Readonly<{
  data: T[];
  type: 'with-header' | 'without-header';
}> &
  (Header<T> | Fields<T>);

@injectable()
export class PrettyTableCreator {
  constructor(
    @inject(GlobalUtils) private readonly _globalUtils: GlobalUtils,
  ) {}
  public builder = <T>(props: TableBuilderType<T>): PrettyTable => {
    const prettyTable = new PrettyTable();

    if (props.type == 'with-header') {
      prettyTable.setHeader([...props.headerKeys.values()]);
    }

    const fields =
      props.type == 'with-header' ? [...props.headerKeys.keys()] : props.fields;

    prettyTable.addRows(
      props.data.map((k) =>
        Object.values(this._globalUtils.pickKeysFromIterable(k, fields)),
      ) as Cell[][],
    );

    return prettyTable;
  };
}
