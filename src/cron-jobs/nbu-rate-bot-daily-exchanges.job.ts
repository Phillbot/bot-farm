import { inject, injectable } from 'inversify';
import { PrettyTable } from 'prettytable.js';
import { CronJob } from 'cron';

import { NBUCurrencyBotUserService } from '@database/index';
import { Logger } from '@helpers/logger';
import { PrettyTableCreator } from '@helpers/table-creator';

import { NBURateBot } from '@telegram/index';
import { TelegramUtils } from '@telegram/common/telegram-utils';
import { NBURateBotUtils, NBURateType, defaultLang, mainCurrencies } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { NbuBotCronTableSchema, NbuBotCronTimezone, NbuBotWebLink } from '@telegram/nbu-rate-bot/symbols';

import { defaultTimeZone } from './utils';

@injectable()
export class NBURateBotDailyExchangesJob {
  constructor(
    @inject(NbuBotCronTimezone.$) private readonly _nbuBotCronTimezone: string,

    @inject(NbuBotCronTableSchema.$) private readonly _nbuBotCronTableSchema: string,
    @inject(NbuBotWebLink.$) private readonly _nbuBotWebLink: string,

    @inject(NBUCurrencyBotUserService) private readonly _nbuCurrencyBotUserService: NBUCurrencyBotUserService,
    @inject(PrettyTableCreator) private readonly _prettyTableCreator: PrettyTableCreator,
    @inject(NBURateBot) private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
    @inject(TelegramUtils) private readonly _telegramUtils: TelegramUtils,
    @inject(Logger) private readonly _logger: Logger,
  ) {}

  private exchangeTableSender() {
    return CronJob.from({
      cronTime: this._nbuBotCronTableSchema,
      onTick: async () => {
        const subscribersUserIds = await this._nbuCurrencyBotUserService.getSubscribersUserIds();

        if (subscribersUserIds?.length) {
          const tasks = [];

          for (let i = 0; i < subscribersUserIds.length; i++) {
            const delay = 250 * i;
            const lang = subscribersUserIds[i].lang ?? defaultLang;
            const table = await this.buildTable(lang);

            tasks.push(
              new Promise(async (resolve) => {
                await new Promise((res) => {
                  setTimeout(res, delay);
                });

                const result = await new Promise((r) => {
                  this._nbuRateBot.bot.api
                    .sendMessage(
                      subscribersUserIds[i].user_id,
                      this._telegramUtils.codeMessageCreator(
                        table.toString(),
                        `*${this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-automatic-exchange-message')}*\n\n`,
                      ),
                      {
                        parse_mode: 'MarkdownV2',
                        reply_markup: this._telegramUtils.inlineKeyboardBuilder([
                          {
                            type: 'url',
                            text: this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-rates-url-text'),
                            url: this._nbuBotWebLink,
                          },
                        ]),
                      },
                    )
                    .catch((e) => this._logger.error('exchangeTableSender', e));

                  r(delay);
                });

                resolve(result);
              }),
            );
          }
          Promise.all(tasks).catch((e) => this._logger.error(e));
        }
      },
      timeZone: this._nbuBotCronTimezone ?? defaultTimeZone,
    }).start();
  }

  private async buildTable(lang: string): Promise<PrettyTable> {
    const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();
    const filteredData = data.filter(({ cc }) => mainCurrencies.some((c) => c === cc));

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
