import { CommandContext } from 'grammy';
import { inject, injectable } from 'inversify';

import { GlobalUtils } from '@helpers/global-utils';
import { PrettyTableCreator } from '@helpers/table-creator';

import { TelegramUtils } from '@telegram/common/telegram-utils';

import { NBURateBotContext, NBURateBotUtils, NBURateType, currencies } from '../nbu-rate.utils';
import { NbuBotWebLink } from '../symbols';

@injectable()
export class NBURateBotRateAllCommand {
  constructor(
    @inject(NbuBotWebLink.$)
    private readonly _nbuBotWebLink: string,
    private readonly _nbuRateBotUtils: NBURateBotUtils,
    private readonly _telegramUtils: TelegramUtils,
    private readonly _prettyTableCreator: PrettyTableCreator,
    private readonly _globalUtils: GlobalUtils,
  ) { }

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();

    const filteredCurrenciesFromCommand = this._nbuRateBotUtils
      .getMatchedCurrenciesFromCommand(ctx.match)
      .filter((curr) => currencies.includes(curr));

    const isExistAdditionalCurrency = this._globalUtils.isArrayNotEmpty(filteredCurrenciesFromCommand);

    const filteredData: NBURateType[] = isExistAdditionalCurrency
      ? data.filter(({ cc }) => filteredCurrenciesFromCommand.includes(cc))
      : data;

    const table = await this._prettyTableCreator.builder<NBURateType>({
      data: filteredData,
      type: 'with-header',
      headerKeys: new Map([
        ['cc', ctx.t('nbu-exchange-bot-exchange-rates-table-cc')],
        ['rate', ctx.t('nbu-exchange-bot-exchange-rates-table-rate')],
      ]),
    });

    await this._telegramUtils.sendReply<NBURateBotContext>({
      ctx,
      text: this._telegramUtils.codeMessageCreator(table.toString()),
      parse_mode: 'MarkdownV2',
      reply_markup: this._telegramUtils.inlineKeyboardBuilder([
        {
          type: 'url',
          text: ctx.t('nbu-exchange-bot-exchange-rates-url-text'),
          url: this._nbuBotWebLink,
        },
      ]),
    });
  }
}
