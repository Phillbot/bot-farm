import { inject, injectable } from 'inversify';
import axios, { AxiosResponse } from 'axios';
import { CommandContext, NextFunction } from 'grammy';

import { TelegramUtils } from '@telegram/telegram-utils';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';

import { NBURateBotContext } from './nbu-rate.bot';

import {
  MainCommandType,
  NBUPeriodRateType,
  NBURateType,
  SubscribeCommandType,
} from './types';

// prettier-ignore
export const  currencies = [
  'AUD','CAD','CNY','CZK','DKK','HKD','HUF','INR','IDR','ILS','JPY','KZT',
  'KRW','MXN','MDL','NZD','NOK','RUB','SGD','ZAR','SEK','CHF','EGP','GBP',
  'USD','BYN','AZN','RON','TRY','XDR','BGN','EUR','PLN','DZD','BDT','AMD',
  'DOP','IRR','IQD','KGS','LBP','LYD','MYR','MAD','PKR','SAR','VND','THB',
  'AED','TND','UZS','TWD','TMT','RSD','TJS','GEL','BRL','XAU','XAG','XPT',
  'XPD',
];

export const mainCurrencies = ['USD', 'EUR'];

export const DefaultLang = 'uk';

export const supportLangs = [DefaultLang, 'en'] as const;

@injectable()
export class NBURateBotUtils {
  constructor(
    @inject(NBUCurrencyBotUser)
    private readonly _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(TelegramUtils)
    private readonly _telegramUtils: TelegramUtils,
  ) {}

  public getNBUExchangeRate = (): Promise<AxiosResponse<NBURateType[]>> => {
    return axios
      .get(String(process.env.NBU_RATE_EXCHANGE_API_URL))
      .then((res) => res)
      .catch((e) => e);
  };

  public getMatchedCurrenciesFromCommand(match: string): string[] {
    return match.trim() !== ''
      ? match.replace(/\s+/g, ' ').trim().toUpperCase().split(' ')
      : [];
  }

  public getTableData = (
    data: NBURateType[],
    fullList: boolean,
    isExistAdditionalCurrency: boolean,
    matchedCurrenciesFromCommand: string[],
  ): { headerKeys: string[]; body: (string | number)[][] } => {
    const schema = {
      cc: 'nbu-exchange-bot-currency',
      rate: 'nbu-exchange-bot-rate',
    };

    const headerKeys: string[] = Object.values(schema);

    const body = data
      .filter((rate) => {
        if (!fullList) {
          return mainCurrencies.includes(rate.cc);
        }

        return isExistAdditionalCurrency
          ? matchedCurrenciesFromCommand.includes(rate.cc) &&
              currencies.includes(rate.cc)
          : rate;
      })
      .map(({ cc, rate }: NBURateType) => [cc, rate]);

    return {
      headerKeys,
      body,
    };
  };

  public codeMessageCreator(message: string, prefix: string = ''): string {
    return `${prefix}\`\`\`${message}\`\`\``;
  }

  public getNBUExchangeRateByPeriod = (
    startDate: string,
    endDate: string,
  ): Promise<AxiosResponse<NBUPeriodRateType[]>> => {
    const url = String(
      process.env.NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL?.replace(
        '{{startDate}}',
        startDate,
      )?.replace('{{endDate}}', endDate),
    );

    return axios
      .get(url)
      .then((res) => res)
      .catch((e) => e);
  };

  public subscribeManager(
    ctx: CommandContext<NBURateBotContext>,
    userId: number,
    type: MainCommandType | SubscribeCommandType,
  ) {
    const isSubscribeAction = type === 'subscribe';

    const createUser = async () => {
      await this._nbuCurrencyBotUser
        .createUser(
          userId,
          false,
          ctx.from?.language_code || DefaultLang,
          ctx.from?.username,
        )
        .then(() => {
          this._telegramUtils.sendReply(
            ctx,
            isSubscribeAction
              ? ctx.t('nbu-exchange-bot-subscribe-activated')
              : ctx.t('nbu-exchange-bot-subscribe-not-active'),
          );
        });
    };

    const updateSubscribe = async () => {
      this._nbuCurrencyBotUser
        .updateUser(
          userId,
          isSubscribeAction,
          ctx.from?.language_code || DefaultLang,
        )
        .then(() => {
          this._telegramUtils.sendReply(
            ctx,
            isSubscribeAction
              ? ctx.t('nbu-exchange-bot-subscribe-activated')
              : ctx.t('nbu-exchange-bot-subscribe-deactivated'),
          );
        });
    };

    const unableToUpdateSubscribe = async () => {
      await this._telegramUtils.sendReply(
        ctx,
        isSubscribeAction
          ? ctx.t('nbu-exchange-bot-subscribe-already-active')
          : ctx.t('nbu-exchange-bot-subscribe-not-active'),
      );
    };

    return { createUser, updateSubscribe, unableToUpdateSubscribe };
  }

  // TODO: separate update lang and get user middlewares
  public updateUserLang = async (
    ctx: NBURateBotContext,
    next: NextFunction,
  ) => {
    if (!ctx.from?.id) {
      return;
    }

    const user = await this._nbuCurrencyBotUser.getUserById(ctx.from.id);

    if (user?.dataValues) {
      if (user.dataValues.lang !== ctx.from.language_code) {
        await this._nbuCurrencyBotUser.updateUser(
          ctx.from.id,
          user.is_subscribe_active,
          ctx.from.language_code || DefaultLang,
        );
      }

      ctx.dataValues = user?.dataValues;
    }

    await next();
  };
}
