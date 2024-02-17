import moment from 'moment';
import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';
import { InputFile } from 'grammy';

import { DefaultLang } from '@telegram/nbu-rate/helpers/nbu-utils';
import { NBURateBotChartBuilder } from '@utils/chart-builder.service';

import { NBUCurrencyBotUser } from '../database/nbu-rate-bot-user.entity';
import { NBURateBot } from '../telegram/nbu-rate/nbu-rate.bot';

@injectable()
export class NBURateBotChartJob {
  constructor(
    @inject(NBURateBotChartBuilder)
    private readonly _nbuRateBotChartBuilder: NBURateBotChartBuilder,
    @inject(NBUCurrencyBotUser)
    private readonly _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(NBURateBot)
    private readonly _nbuRateBot: NBURateBot,
  ) {
    this.chartSenderJob().start();
  }

  private chartSenderJob() {
    return CronJob.from({
      cronTime: process.env.NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA as string,
      onTick: async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const chatIds: ChatIdsData[] =
          await this._nbuCurrencyBotUser.getSubscribersChatIds();

        const chart = await this._nbuRateBotChartBuilder.build();

        const startDate = moment(
          this._nbuRateBotChartBuilder.dates.startDate,
        ).format('YYYY.MM.DD');

        const endDate = moment(
          this._nbuRateBotChartBuilder.dates.endDate,
        ).format('YYYY.MM.DD');

        chatIds.forEach(({ user_id, lang }) => {
          this._nbuRateBot.bot.api
            .sendPhoto(user_id, new InputFile(chart), {
              parse_mode: 'HTML',
              caption: `<b>Weekly Chart</b>\n\n<code>${this._nbuRateBot.i18n.t(
                lang || DefaultLang,
                'nbu-exchange-bot-chart-period',
                {
                  startDate,
                  endDate,
                },
              )}</code>`,
            })
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
