import { inject, injectable } from 'inversify';
import { PrettyTable } from 'prettytable.js';
import { CronJob } from 'cron';

import { NBUCurrencyBotUserService } from '@database';
import { Logger } from '@helpers/logger';
import { PrettyTableCreator } from '@helpers/table-creator';
import { defaultTimeZone } from '@config/date.config';

import { NBURateBot } from '@telegram';
import { TelegramUtils } from '@telegram/common/telegram-utils';
import { NBURateBotUtils, NBURateType, defaultLang, mainCurrencies } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { NbuBotCronTableSchema, NbuBotCronTimezone, NbuBotWebLink } from '@telegram/nbu-rate-bot/symbols';

@injectable()
export class NBURateBotDailyExchangesJob {
  constructor(
    @inject(NbuBotCronTimezone.$)
    private readonly _nbuBotCronTimezone: string,
    @inject(NbuBotCronTableSchema.$)
    private readonly _nbuBotCronTableSchema: string,
    @inject(NbuBotWebLink.$)
    private readonly _nbuBotWebLink: string,
    private readonly _nbuCurrencyBotUserService: NBUCurrencyBotUserService,
    private readonly _prettyTableCreator: PrettyTableCreator,
    private readonly _nbuRateBot: NBURateBot,
    private readonly _nbuRateBotUtils: NBURateBotUtils,
    private readonly _telegramUtils: TelegramUtils,
    private readonly _logger: Logger,
  ) {}

  private exchangeTableSender() {
    return CronJob.from({
      cronTime: this._nbuBotCronTableSchema,
      onTick: async () => {
        const subscribersUserIds = await this._nbuCurrencyBotUserService.getSubscribersUserIds();

        if (subscribersUserIds?.length) {
          const tasks = subscribersUserIds.map((subscriber, index) => {
            const delay = 250 * index;
            const lang = subscriber.lang ?? defaultLang;

            return new Promise(async (resolve) => {
              await new Promise((res) => setTimeout(res, delay));

              const table = await this.buildTable(lang);

              const adv = '';

              const message = this._telegramUtils.codeMessageCreator(
                table.toString(),
                `*${this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-automatic-exchange-message')}*\n\n${adv}\n\n`,
              );

              const result = await this._nbuRateBot.bot.api
                .sendMessage(subscriber.user_id, message, {
                  parse_mode: 'MarkdownV2',
                  link_preview_options: {
                    is_disabled: true,
                  },

                  reply_markup: this._telegramUtils.inlineKeyboardBuilder([
                    {
                      type: 'url',
                      text: this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-rates-url-text'),
                      url: this._nbuBotWebLink,
                    },
                  ]),
                })
                .catch((e) => this._logger.error('exchangeTableSender', e));

              resolve(result);
            });
          });

          Promise.all(tasks).catch((e) => this._logger.error(e));
        }
      },
      timeZone: this._nbuBotCronTimezone ?? defaultTimeZone,
    }).start();
  }

  private async buildTable(lang: string): Promise<PrettyTable> {
    const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();
    const filteredData = data?.filter(({ cc }) => mainCurrencies.some((c) => c === cc));

    const table = await this._prettyTableCreator.builder<NBURateType>({
      data: filteredData,
      type: 'with-header',
      headerKeys: new Map([
        ['cc', this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-rates-table-cc')],
        ['rate', this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-rates-table-rate')],
        ['exchangedate', this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-date')],
      ]),
    });

    return table;
  }

  public start() {
    this.exchangeTableSender();
  }
}
