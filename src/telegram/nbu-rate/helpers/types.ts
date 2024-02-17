export type MainCommandType = 'start';
export type RateCommandType = 'rate' | 'rate_main';
export type SubscribeCommandType = 'subscribe' | 'unsubscribe';

export enum COMMANDS {
  START = 'start',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  RATE = 'rate',
  RATE_MAIN = 'rate_main',
}

export type NBURateType = {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
};

export type NBUPeriodRateType = {
  exchangedate: string;
  r030: number; // TODO: typing 840 978 ...
  cc: string; // TODO: typing as const currencies
  txt: string;
  enname: string;
  rate: number;
  units: number;
  rate_per_unit: number;
  group: string;
  calcdate: string;
};
