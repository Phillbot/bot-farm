import axios, { AxiosResponse } from 'axios';
import { CommandContext, Context, NextFunction, SessionFlavor } from 'grammy';
import { LanguageCode } from 'grammy/types';
import { inject, injectable } from 'inversify';

import { NBUCurrencyBotUserService, NBURateBotUser } from '@database';
import { EmojiFlavor } from '@grammyjs/emoji';
import { I18nFlavor } from '@grammyjs/i18n';
import { SessionData } from '@telegram/common/base-bot';
import { TelegramUtils } from '@telegram/common/telegram-utils';

import { NbuBotApiUrl, NbuBotApiUrlByDate } from './symbols';

type NBUPeriodRateType = Readonly<{
  exchangedate: string;
  r030: R030Type;
  cc: NBURateCCType;
  txt: string;
  enname: string;
  rate: number;
  units: number;
  rate_per_unit: number;
  group: string;
  calcdate: string;
}>;

type NBURateCCType = (typeof currencies)[number];
type R030Type = (typeof R030)[number];

// prettier-ignore
const R030 = [
  '004', '008', '012', '012', '020', '024', '031', '032', '036', '036', '040', '044', '048', '050', '050', '051', '051',
  '052', '056', '060', '064', '068', '072', '084', '090', '096', '100', '104', '108', '112', '116', '124', '124', '132',
  '136', '144', '152', '156', '156', '170', '174', '180', '188', '191', '191', '192', '196', '203', '203', '208', '208',
  '214', '218', '222', '230', '232', '233', '238', '242', '246', '250', '255', '262', '270', '280', '288', '292', '300',
  '320', '324', '328', '332', '340', '344', '344', '348', '348', '352', '356', '356', '360', '360', '364', '364', '368',
  '372', '376', '376', '380', '381', '388', '392', '392', '398', '400', '404', '408', '410', '410', '414', '417', '417',
  '418', '422', '422', '426', '428', '430', '434', '434', '440', '442', '446', '450', '454', '458', '458', '462', '470',
  '478', '480', '484', '484', '496', '498', '498', '504', '504', '508', '512', '516', '524', '528', '532', '533', '548',
  '554', '554', '558', '566', '578', '578', '586', '590', '598', '600', '604', '608', '608', '616', '620', '624', '626',
  '634', '642', '643', '646', '654', '678', '682', '682', '690', '694', '702', '702', '703', '704', '704', '705', '706',
  '710', '710', '716', '724', '728', '736', '740', '748', '752', '752', '756', '756', '760', '762', '764', '764', '776',
  '780', '784', '784', '788', '788', '792', '795', '800', '804', '807', '810', '818', '818', '826', '826', '834', '835',
  '836', '838', '839', '840', '840', '843', '844', '848', '849', '853', '854', '858', '860', '860', '862', '882', '886',
  '890', '891', '894', '901', '901', '928', '931', '932', '933', '933', '934', '934', '936', '936', '937', '938', '941',
  '941', '943', '944', '944', '946', '946', '949', '949', '950', '951', '952', '953', '954', '959', '959', '960', '960',
  '961', '961', '962', '962', '964', '964', '968', '967', '969', '971', '972', '972', '973', '974', '975', '975', '976',
  '977', '978', '978', '980', '981', '981', '985', '985', '986', '986', '990', '991', '997', '998', '999',
] as const;

// prettier-ignore
export const currencies = [
  'AUD', 'CAD', 'CNY', 'CZK', 'DKK', 'HKD', 'HUF', 'INR', 'IDR', 'ILS', 'JPY', 'KZT',
  'KRW', 'MXN', 'MDL', 'NZD', 'NOK', 'RUB', 'SGD', 'ZAR', 'SEK', 'CHF', 'EGP', 'GBP',
  'USD', 'BYN', 'AZN', 'RON', 'TRY', 'XDR', 'BGN', 'EUR', 'PLN', 'DZD', 'BDT', 'AMD',
  'DOP', 'IRR', 'IQD', 'KGS', 'LBP', 'LYD', 'MYR', 'MAD', 'PKR', 'SAR', 'VND', 'THB',
  'AED', 'TND', 'UZS', 'TWD', 'TMT', 'RSD', 'TJS', 'GEL', 'BRL', 'XAU', 'XAG', 'XPT',
  'XPD',
] as const;

export enum COMMANDS {
  START = 'start',
  SUBSCRIBE = 'sub',
  UNSUBSCRIBE = 'unsub',
  RATE = 'r',
  RATE_MAIN = 'm',
  CHART = 'chart',
}

export type NBURateType = Readonly<{
  r030: R030Type;
  txt: string;
  rate: number;
  cc: NBURateCCType;
  exchangedate: string;
}>;

export const mainCurrencies = ['USD', 'EUR'] as const;
export const defaultLang: LanguageCode = 'uk';

export const supportedLangs: LanguageCode[] = [defaultLang, 'en'] as LanguageCode[];

export type NBURateBotContext = EmojiFlavor<
  Pick<NBURateBotUser, 'dataValues'> &
  Context &
  SessionFlavor<SessionData> &
  I18nFlavor & { nbuExchangeData?: NBURateType[] }
>;

@injectable()
export class NBURateBotUtils {
  constructor(
    @inject(NbuBotApiUrlByDate.$)
    private readonly _nbuBotApiUrlByDate: string,
    @inject(NbuBotApiUrl.$)
    private readonly _nbuBotApiUrl: string,
    private readonly _nbuCurrencyBotUserService: NBUCurrencyBotUserService,
    private readonly _telegramUtils: TelegramUtils,
  ) { }

  public getNBUExchangeRate = (): Promise<AxiosResponse<NBURateType[]>> => {
    return axios
      .get(this._nbuBotApiUrl)
      .then((res) => res)
      .catch((e) => e);
  };

  public getMatchedCurrenciesFromCommand(match: string): NBURateCCType[] {
    const matchCurrencies: string[] | (typeof currencies)[] =
      match.trim() !== '' ? match.replace(/\s+/g, ' ').trim().toUpperCase().split(' ') : [];

    return matchCurrencies as NBURateCCType[];
  }

  public getNBUExchangeRateByPeriod = (
    startDate: string,
    endDate: string,
  ): Promise<AxiosResponse<NBUPeriodRateType[]>> => {
    const url = String(this._nbuBotApiUrlByDate?.replace('{{startDate}}', startDate)?.replace('{{endDate}}', endDate));

    return axios
      .get(url)
      .then((res) => res)
      .catch((e) => e);
  };

  public subscribeManager(
    ctx: CommandContext<NBURateBotContext>,
    userId: number,
    type: COMMANDS.START | COMMANDS.SUBSCRIBE | COMMANDS.UNSUBSCRIBE,
  ) {
    const isSubscribeAction = type === COMMANDS.SUBSCRIBE;

    const createUser = async () => {
      await this._nbuCurrencyBotUserService
        .createUser({
          user_id: userId,
          user_name: ctx.from?.username,
          is_subscribe_active: false,
          lang: ctx.from?.language_code ?? defaultLang,
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
      this._nbuCurrencyBotUserService
        .updateUser({
          user_id: userId,
          user_name: ctx.from?.username,
          is_subscribe_active: isSubscribeAction,
          lang: ctx.from?.language_code ?? defaultLang,
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

  public tryUpdateUserLang = async (ctx: NBURateBotContext, next: NextFunction) => {
    if (!ctx.from?.id) {
      return;
    }

    const user = await this._nbuCurrencyBotUserService.getUserById({
      user_id: ctx.from.id,
    });

    if (user?.dataValues) {
      if (user.dataValues.lang !== ctx.from.language_code) {
        await this._nbuCurrencyBotUserService.updateUser({
          user_id: ctx.from.id,
          user_name: ctx.from.username,
          is_subscribe_active: user.is_subscribe_active,
          lang: ctx.from.language_code ?? defaultLang,
        });
      }

      ctx.dataValues = user?.dataValues;
    }

    await next();
  };
}
