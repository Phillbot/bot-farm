import { CommandContext } from 'grammy';

import { NBUCurrencyContext } from '../nbu-rate.bot';
import { NBUCurrencyRateUtils } from '../nbu-utils';

export type NBURate = {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
};

export const nbuRate = async (ctx: CommandContext<NBUCurrencyContext>) => {
  const onlyMain = ctx.message?.text.includes('/rate_main') || false;

  const additionalCurrenciesFromCommand =
    ctx.match.trim() !== ''
      ? ctx.match.replace(/\s+/g, ' ').trim().toUpperCase().split(' ')
      : [];

  const filteredCurrenciesFromCommand = additionalCurrenciesFromCommand.filter(
    (curr) => NBUCurrencyRateUtils.currencies.includes(curr),
  );

  const isExistAdditionalCurrency = filteredCurrenciesFromCommand.length > 0;

  const { data } = await NBUCurrencyRateUtils.getNBUExchangeRate();

  const convertCurrencyData = await NBUCurrencyRateUtils.getConvertCurrencyData(
    data,
    onlyMain,
    isExistAdditionalCurrency,
    additionalCurrenciesFromCommand,
  );

  const message =
    NBUCurrencyRateUtils.createTableForMessage(convertCurrencyData);

  await ctx
    .reply(NBUCurrencyRateUtils.createrMessage(message.table.toString()), {
      parse_mode: 'MarkdownV2',
    })
    .catch((error) => {
      // eslint-disable-next-line
      console.log(error);
    })
    // collect logs?
    // eslint-disable-next-line
    .finally(() => console.log(ctx.message));
};
