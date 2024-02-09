import { CommandContext } from 'grammy';

import { TelegramUtils } from '@telegram/telegram-utils';

import { NBUCurrencyContext } from '../nbu-rate.bot';
import { NBUCurrencyRateUtils } from '../helpers/nbu-utils';

export const nbuRate = async (ctx: CommandContext<NBUCurrencyContext>) => {
  try {
    const fullList = !ctx.message?.text.includes('/rate_main') || false;

    const matchedCurrenciesFromCommand =
      NBUCurrencyRateUtils.getMatchedCurrenciesFromCommand(ctx.match);

    const filteredCurrenciesFromCommand = matchedCurrenciesFromCommand.filter(
      (curr) => NBUCurrencyRateUtils.currencies.includes(curr),
    );

    const isExistAdditionalCurrency = filteredCurrenciesFromCommand.length > 0;

    const { data } = await NBUCurrencyRateUtils.getNBUExchangeRate();

    const convertCurrencyData =
      await NBUCurrencyRateUtils.getConvertCurrencyData(
        data,
        fullList,
        isExistAdditionalCurrency,
        matchedCurrenciesFromCommand,
      );

    const message =
      NBUCurrencyRateUtils.createTableForMessage(convertCurrencyData);

    await TelegramUtils.sendReply<NBUCurrencyContext>(
      ctx,
      NBUCurrencyRateUtils.creatorMessage(message.table.toString()),
      'MarkdownV2',
    );
  } catch (error) {
    // TODO: logger
    // eslint-disable-next-line
    console.log('nbuRate', error);
  }
};
