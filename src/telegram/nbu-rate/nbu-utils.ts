import axios, { AxiosResponse } from 'axios';
import { CommandContext } from 'grammy';

import { botSubscribers } from '@database/postgresql/models/bot-subscribers.model';
import { TelegramUtils } from '@telegram/telegram-utils';
import { TableCreator } from '@utils/table-creator';

import { NBUCurrencyContext } from './nbu-rate.bot';
import { nbuTexts } from './nbu-texts';
import { MainCommandType, NBURate, SubscribeCommandType } from './types';

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

  public static getMatchedCurrenciesFromCommand(match: string): string[] {
    return match.trim() !== ''
      ? match.replace(/\s+/g, ' ').trim().toUpperCase().split(' ')
      : [];
  }

  public static getConvertCurrencyData = (
    data: NBURate[],
    fullList: boolean,
    isExistAdditionalCurrency: boolean,
    matchedCurrenciesFromCommand: string[],
  ): (string | number)[][] => {
    return data
      .filter((rate) => {
        if (!fullList) {
          return NBUCurrencyRateUtils.mainCurrencies.includes(rate.cc);
        }

        return isExistAdditionalCurrency
          ? matchedCurrenciesFromCommand.includes(rate.cc) &&
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

  // TODO: rework with separately class ?
  // TODO: i18 for messages
  public static subscribeManager = {
    createUser: async (
      ctx: CommandContext<NBUCurrencyContext>,
      type: MainCommandType | SubscribeCommandType,
    ) => {
      await botSubscribers
        .create({
          user_id: ctx.from?.id,
          user_name: ctx.from?.username,
          is_subscribe_active: false,
        })
        .then(() => {
          TelegramUtils.sendReply(
            ctx,
            type === 'start'
              ? nbuTexts['start'][
                  TelegramUtils.getLang(ctx.from?.language_code)
                ]
              : type === 'subscribe'
                ? nbuTexts['subscribe activated'][
                    TelegramUtils.getLang(ctx.from?.language_code)
                  ]
                : nbuTexts['subscribe not active'][
                    TelegramUtils.getLang(ctx.from?.language_code)
                  ],
          );
        })
        // TODO: logger
        // eslint-disable-next-line
        .catch((e) => console.log(e));
    },

    updateSubscribe: async (
      ctx: CommandContext<NBUCurrencyContext>,
      type: SubscribeCommandType,
    ) => {
      await botSubscribers
        .update(
          { is_subscribe_active: type === 'subscribe' ? true : false },
          { where: { user_id: ctx.from?.id } },
        )
        .then(() => {
          TelegramUtils.sendReply<NBUCurrencyContext>(
            ctx,
            nbuTexts[
              type === 'subscribe'
                ? 'subscribe activated'
                : 'subscribe deactivated'
            ][TelegramUtils.getLang(ctx.from?.language_code)],
          );
        })
        // TODO: logger
        // eslint-disable-next-line
        .catch((e) => console.log(e));
    },

    unableToUpdateSubscribe: async (
      ctx: CommandContext<NBUCurrencyContext>,
      type: SubscribeCommandType,
    ) => {
      await TelegramUtils.sendReply<NBUCurrencyContext>(
        ctx,
        nbuTexts[
          type === 'subscribe'
            ? 'subscribe already active'
            : 'subscribe not active'
        ][TelegramUtils.getLang(ctx.from?.language_code)],
      );
    },
  };
}
