import { inject, injectable } from 'inversify';
import { CommandContext } from 'grammy';

import { TelegramUtils } from '@telegram/common/telegram-utils';
import { PrettyTableCreator } from '@helpers/table-creator';

import { NBURateBotContext } from '../nbu-rate.bot';
import { NBURateBotUtils, NBURateType, mainCurrencies } from '../nbu-rate.utils';

@injectable()
export class NBURateBotRateMainCommand {
  constructor(
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
    @inject(TelegramUtils) private readonly _telegramUtils: TelegramUtils,
    @inject(PrettyTableCreator) private readonly _prettyTableCreator: PrettyTableCreator,
  ) {}

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();
    const filteredData = data.filter(({ cc }) => mainCurrencies.some((c) => c === cc));

    const table = await this._prettyTableCreator.builder<NBURateType>({
      data: filteredData,
      type: 'with-header',
      headerKeys: new Map([
        ['cc', ctx.t('nbu-exchange-bot-exchange-rates-table-cc')],
        ['rate', ctx.t('nbu-exchange-bot-exchange-rates-table-rate')],
        ['exchangedate', ctx.t('nbu-exchange-bot-exchange-date')],
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
          url: process.env.NBU_RATE_WEB_LINK as string,
        },
      ]),
    });
  }
}
