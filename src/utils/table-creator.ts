import { Cell, PrettyTable } from 'prettytable.js';

export class TableCreator {
  constructor(
    private readonly _header: Cell[] | null,
    private readonly _body: Cell[][],
  ) {}

  get header(): Cell[] | null {
    return this._header;
  }

  get body(): Cell[][] {
    return this._body;
  }

  get table() {
    const table = new PrettyTable();
    this.header != null && table.setHeader(this.header);
    table.addRows(this.body);

    return table;
  }
}
