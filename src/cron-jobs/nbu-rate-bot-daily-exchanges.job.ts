import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';

import { NBURateBot } from '@telegram/index';
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
        const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();

        const convertCurrencyData =
          await this._nbuRateBotUtils.getConvertCurrencyData(
            data,
            false,
            false,
            [],
          );

        const message =
          this._nbuRateBotUtils.createMessageWithTable(convertCurrencyData);

        const chatIds = await this._nbuCurrencyBotUser.getSubscribers();

        chatIds?.forEach(({ user_id, lang }) => {
          this._nbuRateBot.bot.api
            .sendMessage(
              user_id,
              this._nbuRateBotUtils.codeMessageCreator(
                message.table.toString(),
                `*${this._nbuRateBot.i18n.t(lang || DefaultLang, 'nbu-exchange-bot-today-exchange')}:*\n\n`,
              ),
              { parse_mode: 'MarkdownV2' },
            )
            .catch((error) => {
              // eslint-disable-next-line
              console.log(error);
            });
        });
      },
      timeZone: nbuRateBotTimezone,
    });
  }
}
