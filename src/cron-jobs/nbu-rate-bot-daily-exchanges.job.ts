import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';

import { NBURateBot } from '@telegram/index';
import { TableCreator } from '@utils/table-creator';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import {
  DefaultLang,
  NBURateBotUtils,
} from '@telegram/nbu-rate-bot/nbu-rate.utils';

import { nbuRateBotTimezone } from './utils';

@injectable()
export class NBURateBotDailyExchangesJob {
  constructor(
    @inject(NBURateBotUtils)
    private readonly _nbuRateBotUtils: NBURateBotUtils,
    @inject(NBUCurrencyBotUser)
    private readonly _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(NBURateBot)
    private readonly _nbuRateBot: NBURateBot,
  ) {
    this.exchangeTableSender().start();
  }

  private exchangeTableSender() {
    return CronJob.from({
      cronTime: process.env.NBU_RATE_CRON_SCHEMA as string,
      onTick: async () => {
        const subscribersUserIds =
          await this._nbuCurrencyBotUser.getSubscribersUserIds();

        if (subscribersUserIds?.length) {
          const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();

          const { headerKeys, body } = await this._nbuRateBotUtils.getTableData(
            data,
            false,
            false,
            [],
          );

          const tasks = [];

          for (let i = 0; i < subscribersUserIds.length; i++) {
            const delay = 250 * i;

            const message = this._nbuRateBotUtils.codeMessageCreator(
              new TableCreator(
                headerKeys.map((k) =>
                  this._nbuRateBot.i18n.t(subscribersUserIds[i].lang, k),
                ),
                body,
              ).table.toString(),
              `*${this._nbuRateBot.i18n.t(subscribersUserIds[i].lang || DefaultLang, 'nbu-exchange-bot-today-exchange')}:*\n\n`,
            );

            tasks.push(
              new Promise(async (resolve) => {
                await new Promise((res) => {
                  setTimeout(res, delay);
                });

                const result = await new Promise((r) => {
                  this._nbuRateBot.bot.api
                    .sendMessage(subscribersUserIds[i].user_id, message, {
                      parse_mode: 'MarkdownV2',
                    })
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
    });
  }
}
