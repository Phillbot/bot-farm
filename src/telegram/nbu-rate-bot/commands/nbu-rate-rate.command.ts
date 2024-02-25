import { inject, injectable } from 'inversify';
import { PrettyTable } from 'prettytable.js';
import { CommandContext } from 'grammy';

import { TelegramUtils } from '@telegram/telegram-utils';
import {
  PrettyTableCreator,
  PrettyTableHeaderKeysType,
} from '@helpers/table-creator';

import { NBURateBotContext } from '../nbu-rate.bot';
import {
  NBURateBotUtils,
  NBURateType,
  currencies,
  nbuRateWebLink,
} from '../nbu-rate.utils';

@injectable()
export class NBURateBotRateCommand {
  constructor(
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
    @inject(TelegramUtils) private readonly _telegramUtils: TelegramUtils,
    @inject(PrettyTableCreator)
    private readonly _prettyTableCreator: PrettyTableCreator,
  ) {}

  private async contentBuilder(
    match: string,
    headerKeys: PrettyTableHeaderKeysType<NBURateType>,
  ): Promise<PrettyTable> {
    const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();

    const matchedCurrenciesFromCommand =
      this._nbuRateBotUtils.getMatchedCurrenciesFromCommand(match);

    const filteredCurrenciesFromCommand = matchedCurrenciesFromCommand.filter(
      (curr) => currencies.includes(curr),
    );

    const isExistAdditionalCurrency: boolean =
      filteredCurrenciesFromCommand.length > 0;

    const filteredData: NBURateType[] = isExistAdditionalCurrency
      ? data.filter(({ cc }) => filteredCurrenciesFromCommand.includes(cc))
      : data;

    return this._prettyTableCreator.builder<NBURateType>({
      data: filteredData,
      type: 'with-header',
      headerKeys,
    });
  }

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    const table: PrettyTable = await this.contentBuilder(
      ctx.match,
      new Map([
        ['cc', ctx.t('nbu-exchange-bot-exchange-rates-table-cc')],
        ['rate', ctx.t('nbu-exchange-bot-exchange-rates-table-rate')],
      ]),
    );

    await this._telegramUtils.sendReply<NBURateBotContext>({
      ctx,
      text: this._telegramUtils.codeMessageCreator(table.toString()),
      parse_mode: 'MarkdownV2',
      reply_markup: this._telegramUtils.inlineKeyboardBuilder([
        {
          type: 'url',
          text: ctx.t('nbu-exchange-bot-exchange-rates-url-text'),
          url: nbuRateWebLink,
          makeRow: false,
        },
      ]),
    });
  }
}
