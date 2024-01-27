import axios, { AxiosResponse } from 'axios';

import { TableCreator } from '@utils/table-creator';

import { NBURate } from './commands/nbu-rate.command';

export class NBUCurrencyRateUtils {
  // prettier-ignore
  public static currencies: string[] = [
    'AUD','CAD','CNY','CZK','DKK','HKD','HUF','INR','IDR','ILS','JPY','KZT',
    'KRW','MXN','MDL','NZD','NOK','RUB','SGD','ZAR','SEK','CHF','EGP','GBP',
    'USD','BYN','AZN','RON','TRY','XDR','BGN','EUR','PLN','DZD','BDT','AMD',
    'DOP','IRR','IQD','KGS','LBP','LYD','MYR','MAD','PKR','SAR','VND','THB',
    'AED','TND','UZS','TWD','TMT','RSD','TJS','GEL','BRL','XAU','XAG','XPT',
    'XPD',
  ];

  public static mainCurrencies: string[] = ['USD', 'EUR'];

  public static getNBUExchangeRate = (): Promise<AxiosResponse<NBURate[]>> => {
    return axios
      .get(String(process.env.NBU_RATE_EXCHANGE_API_URL))
      .then((res) => res)
      .catch((e) => e);
  };

  public static getConvertCurrencyData = (
    data: NBURate[],
    onlyMain: boolean,
    isExistAdditionalCurrency: boolean,
    additionalCurrenciesFromCommand: string[],
  ): (string | number)[][] => {
    return data
      .filter((rate) => {
        if (onlyMain) {
          return NBUCurrencyRateUtils.mainCurrencies.includes(rate.cc);
        }

        return isExistAdditionalCurrency
          ? additionalCurrenciesFromCommand.includes(rate.cc) &&
              NBUCurrencyRateUtils.currencies.includes(rate.cc)
          : rate;
      })
      .map(({ r030, cc, rate }: NBURate) => [r030, cc, rate]);
  };

  public static createTableForMessage(
    body: (string | number)[][],
  ): TableCreator {
    const header = ['Code', 'Currency', 'Rate'];
    const nbuTable = new TableCreator(header, body);

    return nbuTable;
  }

  public static creatorMessage(message: string, prefix: string = ''): string {
    return `${prefix}\`\`\`${message}\`\`\``;
  }
}
