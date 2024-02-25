import { inject, injectable } from 'inversify';
import axios, { AxiosResponse } from 'axios';
import { CommandContext, NextFunction } from 'grammy';

import { TelegramUtils } from '@telegram/telegram-utils';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';

import { NBURateBotContext } from './nbu-rate.bot';

export type MainCommandType = 'start';
export type RateCommandType = 'rate' | 'rate_main';
export type SubscribeCommandType = 'subscribe' | 'unsubscribe';

type NBUPeriodRateType = Readonly<{
  exchangedate: string;
  r030: number; // TODO: types for 840 978 ...
  cc: (typeof currencies)[number];
  txt: string;
  enname: string;
  rate: number;
  units: number;
  rate_per_unit: number;
  group: string;
  calcdate: string;
}>;

export enum COMMANDS {
  START = 'start',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  RATE = 'rate',
  RATE_MAIN = 'rate_main',
}

export type NBURateType = Readonly<{
  r030: number;
  txt: string;
  rate: number;
  cc: (typeof currencies)[number];
  exchangedate: string;
}>;

// prettier-ignore
export const  currencies = [
  'AUD','CAD','CNY','CZK','DKK','HKD','HUF','INR','IDR','ILS','JPY','KZT',
  'KRW','MXN','MDL','NZD','NOK','RUB','SGD','ZAR','SEK','CHF','EGP','GBP',
  'USD','BYN','AZN','RON','TRY','XDR','BGN','EUR','PLN','DZD','BDT','AMD',
  'DOP','IRR','IQD','KGS','LBP','LYD','MYR','MAD','PKR','SAR','VND','THB',
  'AED','TND','UZS','TWD','TMT','RSD','TJS','GEL','BRL','XAU','XAG','XPT',
  'XPD',
] as const;

export const mainCurrencies = ['USD', 'EUR'] as const;

export const defaultLang = 'uk' as const; // TODO: move to types?

export const supportLangs = ['uk', 'en'] as const;

export const nbuRateWebLink = 'https://bank.gov.ua/ua/markets/exchangerates';

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

  public getMatchedCurrenciesFromCommand(
    match: string,
  ): (typeof currencies)[number][] {
    const matchCurrencies: string[] | (typeof currencies)[] =
      match.trim() !== ''
        ? match.replace(/\s+/g, ' ').trim().toUpperCase().split(' ')
        : [];

    return matchCurrencies as (typeof currencies)[number][];
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
        .createUser({
          user_id: userId,
          user_name: ctx.from?.username,
          is_subscribe_active: false,
          lang: ctx.from?.language_code || defaultLang,
        })
        .then(() => {
          this._telegramUtils.sendReply({
            ctx,
            text: isSubscribeAction
              ? ctx.t('nbu-exchange-bot-subscribe-activated')
              : ctx.t('nbu-exchange-bot-subscribe-not-active'),
          });
        });
    };

    const updateSubscribe = async () => {
      this._nbuCurrencyBotUser
        .updateUser({
          user_id: userId,
          user_name: ctx.from?.username,
          is_subscribe_active: isSubscribeAction,
          lang: ctx.from?.language_code || defaultLang,
        })
        .then(() => {
          this._telegramUtils.sendReply({
            ctx,
            text: isSubscribeAction
              ? ctx.t('nbu-exchange-bot-subscribe-activated')
              : ctx.t('nbu-exchange-bot-subscribe-deactivated'),
          });
        });
    };

    const unableToUpdateSubscribe = async () => {
      await this._telegramUtils.sendReply({
        ctx,
        text: isSubscribeAction
          ? ctx.t('nbu-exchange-bot-subscribe-already-active')
          : ctx.t('nbu-exchange-bot-subscribe-not-active'),
      });
    };

    return { createUser, updateSubscribe, unableToUpdateSubscribe };
  }

  public tryUpdateUserLang = async (
    ctx: NBURateBotContext,
    next: NextFunction,
  ) => {
    if (!ctx.from?.id) {
      return;
    }

    const user = await this._nbuCurrencyBotUser.getUserById({
      user_id: ctx.from.id,
    });

    if (user?.dataValues) {
      if (user.dataValues.lang !== ctx.from.language_code) {
        await this._nbuCurrencyBotUser.updateUser({
          user_id: ctx.from.id,
          user_name: ctx.from.username,
          is_subscribe_active: user.is_subscribe_active,
          lang: ctx.from.language_code || defaultLang,
        });
      }

      ctx.dataValues = user?.dataValues;
    }

    await next();
  };
}
