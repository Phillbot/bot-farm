import { NBUCurrencyRateUtils } from './nbu-utils';

export type MainCommandType = 'start';
export type RateCommandType = 'rate' | 'rate_main';
export type SubscribeCommandType = 'subscribe' | 'unsubscribe';

export type CommandType =
  | MainCommandType
  | RateCommandType
  | SubscribeCommandType;

export type NBURateType = {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
};

export type NBUPeriodRateType = {
  exchangedate: string;
  r030: number; // need typing 840 978 ...
  cc: CurrenciesType;
  txt: string;
  enname: string;
  rate: number;
  units: number;
  rate_per_unit: number;
  group: string;
  calcdate: string;
};

export type CurrenciesType = (typeof NBUCurrencyRateUtils.currencies)[number];
export type MainCurrenciesType =
  (typeof NBUCurrencyRateUtils.mainCurrencies)[number];
