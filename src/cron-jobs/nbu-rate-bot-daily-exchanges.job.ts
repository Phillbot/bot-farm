import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';

import { NBURateBot } from '@telegram/index';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { NBURateBotUtils } from '@telegram/nbu-rate/helpers/nbu-utils';
import { t } from 'i18next';

/**
 * Every time when we use part of find we cant use TS
 * https://sequelize.org/docs/v7/querying/select-in-depth/
 */

type ChatIdsData = {
  user_id: number | string;
};

@injectable()
export class NBURateBotDailyExchangesJob {
  constructor(
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
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
            true,
            false,
            [],
          );

        const message =
          this._nbuRateBotUtils.createMessageWithTable(convertCurrencyData);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const chatIds: ChatIdsData[] =
          await this._nbuCurrencyBotUser.getSubscribersChatIds();

        chatIds.forEach(({ user_id }) => {
          this._nbuRateBot.bot.api
            .sendMessage(
              user_id,
              this._nbuRateBotUtils.codeMessageCreator(
                message.table.toString(),
                `*${t('t:nbu-exchange-bot-today-exchange')}:*\n\n`,
              ),
              { parse_mode: 'MarkdownV2' },
            )
            .catch((error) => {
              // eslint-disable-next-line
              console.log(error);
            });
        });
      },
      timeZone: 'Europe/Kyiv',
    });
  }
}
