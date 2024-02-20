import { inject, injectable } from 'inversify';
import { CommandContext } from 'grammy';

import { TelegramUtils } from '@telegram/telegram-utils';
import { TableCreator } from '@utils/table-creator';

import { NBURateBotContext } from '../nbu-rate.bot';
import { NBURateBotUtils, currencies } from '../nbu-rate.utils';

@injectable()
export class NBURateBotRateCommand {
  constructor(
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
    @inject(TelegramUtils) private _telegramUtils: TelegramUtils,
  ) {}

  public async withCtx(ctx: CommandContext<NBURateBotContext>) {
    const fullList = !ctx.message?.text.includes('/rate_main') || false;

    const matchedCurrenciesFromCommand =
      this._nbuRateBotUtils.getMatchedCurrenciesFromCommand(ctx.match);

    const filteredCurrenciesFromCommand = matchedCurrenciesFromCommand.filter(
      (curr) => currencies.includes(curr),
    );

    const isExistAdditionalCurrency = filteredCurrenciesFromCommand.length > 0;

    const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();

    const { headerKeys, body } = await this._nbuRateBotUtils.getTableData(
      data,
      fullList,
      isExistAdditionalCurrency,
      matchedCurrenciesFromCommand,
    );

    await this._telegramUtils.sendReply<NBURateBotContext>(
      ctx,
      this._nbuRateBotUtils.codeMessageCreator(
        new TableCreator(
          headerKeys.map((k) => ctx.t(k)),
          body,
        ).table.toString(),
      ),
      'MarkdownV2',
    );
  }
}
