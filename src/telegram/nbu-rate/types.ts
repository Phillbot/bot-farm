export type MainCommandType = 'start';
export type RateCommandType = 'rate' | 'rate_main';
export type SubscribeCommandType = 'subscribe' | 'unsubscribe';

export type CommandType =
  | MainCommandType
  | RateCommandType
  | SubscribeCommandType;

export type NBURate = {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
};
