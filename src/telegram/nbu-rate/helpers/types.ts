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

export enum COMMANDS_DESCRIPTORS {
  START = 'Welcome, friend!',
  SUBSCRIBE = 'Will send exchange to user automatically 2 times per day',
  UNSUBSCRIBE = 'Remove subscribe',
  RATE = 'Show NBU exchanges. All or by currencies',
  RATE_MAIN = 'Show NBU USD and EUR exchanges',
}

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
  cc: string; // need typing as const currencies
  txt: string;
  enname: string;
  rate: number;
  units: number;
  rate_per_unit: number;
  group: string;
  calcdate: string;
};
