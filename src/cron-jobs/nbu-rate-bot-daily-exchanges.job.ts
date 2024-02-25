import { inject, injectable } from 'inversify';
import { PrettyTable } from 'prettytable.js';
import { CronJob } from 'cron';

import { NBURateBot } from '@telegram/index';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { NBURateBotRateMainCommand } from '@telegram/nbu-rate-bot/commands';
import {
  defaultLang,
  nbuRateWebLink,
} from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { TelegramUtils } from '@telegram/telegram-utils';

import { nbuRateBotTimezone } from './utils';

@injectable()
export class NBURateBotDailyExchangesJob {
  constructor(
    @inject(NBUCurrencyBotUser)
    private readonly _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(NBURateBotRateMainCommand)
    private readonly _nbuRateBotRateMainCommand: NBURateBotRateMainCommand,

    @inject(NBURateBot)
    private readonly _nbuRateBot: NBURateBot,
    @inject(TelegramUtils)
    private readonly _telegramUtils: TelegramUtils,
  ) {}

  private exchangeTableSender() {
    return CronJob.from({
      cronTime: process.env.NBU_RATE_CRON_SCHEMA as string,
      onTick: async () => {
        const subscribersUserIds =
          await this._nbuCurrencyBotUser.getSubscribersUserIds();

        if (subscribersUserIds?.length) {
          const tasks = [];

          for (let i = 0; i < subscribersUserIds.length; i++) {
            const delay = 250 * i;
            const lang = subscribersUserIds[i].lang || defaultLang;
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
                        `*${this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-today-exchange')}:*\n\n`,
                      ),
                      {
                        parse_mode: 'MarkdownV2',
                        reply_markup: this._telegramUtils.inlineKeyboardBuilder(
                          [
                            {
                              type: 'url',
                              text: this._nbuRateBot.i18n.t(
                                lang,
                                'nbu-exchange-bot-exchange-rates-url-text',
                              ),
                              url: nbuRateWebLink,
                              makeRow: false,
                            },
                          ],
                        ),
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
    return await this._nbuRateBotRateMainCommand.withoutCtx(
      new Map([
        [
          'cc',
          this._nbuRateBot.i18n.t(
            lang,
            'nbu-exchange-bot-exchange-rates-table-cc',
          ),
        ],
        [
          'rate',
          this._nbuRateBot.i18n.t(
            lang,
            'nbu-exchange-bot-exchange-rates-table-rate',
          ),
        ],
      ]),
    );
  }

  public start() {
    this.exchangeTableSender();
  }
}
