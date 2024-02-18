import moment from 'moment';
import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';
import { InputFile } from 'grammy';

import {
  DefaultLang,
  NBURateBotUtils,
} from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { NBURateBotChartBuilder } from '@telegram/nbu-rate-bot/nbu-rate-chart-builder.service';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { NBURateBot } from '@telegram/index';

import { nbuRateBotTimezone } from './utils';

@injectable()
export class NBURateBotChartJob {
  private readonly _startDate = moment().startOf('month').format('YYYYMMDD'); // move to ENV?
  private readonly _endDate = moment().format('YYYYMMDD');
  private readonly _nbuRateChartBuilderService = new NBURateBotChartBuilder(
    this._nbuRateBotUtils,
    this._startDate,
    this._endDate,
  );

  constructor(
    @inject(NBUCurrencyBotUser)
    private readonly _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(NBURateBot)
    private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotUtils)
    private readonly _nbuRateBotUtils: NBURateBotUtils,
  ) {
    this.chartSenderJob().start();
  }

  private chartSenderJob() {
    return CronJob.from({
      cronTime: process.env.NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA as string,
      onTick: async () => {
        const chatIds = await this._nbuCurrencyBotUser.getSubscribers();
        const chart = await this._nbuRateChartBuilderService.build();
        const startDate = moment(
          this._nbuRateChartBuilderService.dates.startDate,
        ).format('YYYY.MM.DD');
        const endDate = moment(
          this._nbuRateChartBuilderService.dates.endDate,
        ).format('YYYY.MM.DD');

        chatIds?.forEach(({ user_id, lang }) => {
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
      timeZone: nbuRateBotTimezone,
    });
  }
}
