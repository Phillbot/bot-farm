import { inject, injectable } from 'inversify';
import { Cell, PrettyTable } from 'prettytable.js';

import { LoggerToken } from '@config/symbols';

import { GlobalUtils } from '@helpers/global-utils';
import { Logger } from '@helpers/logger';

export type PrettyTableHeaderKeysType<T> = Readonly<Map<Partial<keyof T>, string>>;

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
    private readonly _globalUtils: GlobalUtils,
    @inject(LoggerToken.$)
    private readonly _logger: Logger,
  ) { }

  /**
   * Builds a PrettyTable with or without headers based on the provided properties.
   * @param props - Configuration properties for building the table.
   * @returns An instance of PrettyTable.
   */
  public builder = <T>(props: TableBuilderType<T>): PrettyTable => {
    const prettyTable = new PrettyTable();

    try {
      if (props.type === 'with-header') {
        prettyTable.setHeader([...props.headerKeys.values()]);
      }

      const fields = props.type === 'with-header' ? [...props.headerKeys.keys()] : props.fields;

      prettyTable.addRows(
        props.data.map((k) => Object.values(this._globalUtils.pickKeysFromIterable(k, fields))) as Cell[][],
      );

      this._logger.info('Table built successfully');
    } catch (error) {
      this._logger.error('Error building table:', error);
    }

    return prettyTable;
  };
}
