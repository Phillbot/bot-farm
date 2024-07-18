import { inject, injectable } from 'inversify';
import { PrettyTable } from 'prettytable.js';
import { CronJob } from 'cron';

import { NBURateBot } from '@telegram/index';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { TelegramUtils } from '@telegram/common/telegram-utils';
import { PrettyTableCreator } from '@helpers/table-creator';
import { NBURateBotUtils, NBURateType, defaultLang, mainCurrencies } from '@telegram/nbu-rate-bot/nbu-rate.utils';

import { nbuRateBotTimezone } from './utils';

@injectable()
export class NBURateBotDailyExchangesJob {
  constructor(
    @inject(NBUCurrencyBotUser) private readonly _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(PrettyTableCreator) private readonly _prettyTableCreator: PrettyTableCreator,
    @inject(NBURateBot) private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
    @inject(TelegramUtils) private readonly _telegramUtils: TelegramUtils,
  ) {}

  private exchangeTableSender() {
    return CronJob.from({
      cronTime: process.env.NBU_RATE_CRON_SCHEMA!,
      onTick: async () => {
        const subscribersUserIds = await this._nbuCurrencyBotUser.getSubscribersUserIds();

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
                            url: process.env.NBU_RATE_WEB_LINK!,
                          },
                        ]),
                      },
                    )
                    // eslint-disable-next-line
                    .catch((e) => console.error('exchangeTableSender', e));

                  r(delay);
                });

                resolve(result);
              }),
            );
          }
          // eslint-disable-next-line
          Promise.all(tasks).catch((e) => console.error(e));
        }
      },
      timeZone: nbuRateBotTimezone,
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
