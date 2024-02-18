import moment from 'moment';
import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';
import { InputFile } from 'grammy';

import { DefaultLang } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { NBURateBotChartBuilder } from '@telegram/nbu-rate-bot/nbu-rate-chart-builder.service';
import { NBURateBot } from '@telegram/index';

import { nbuRateBotTimezone } from './utils';

@injectable()
export class NBURateBotChartJob {
  private readonly _startDate = moment().startOf('month').format('YYYYMMDD'); // move to ENV?
  private readonly _endDate = moment().format('YYYYMMDD');

  constructor(
    @inject(NBUCurrencyBotUser)
    private readonly _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(NBURateBot)
    private readonly _nbuRateBot: NBURateBot,

    @inject(NBURateBotChartBuilder)
    private readonly _nbuRateBotChartBuilder: NBURateBotChartBuilder,
  ) {
    this._nbuRateBotChartBuilder.setDates(this._startDate, this._endDate);
    this.chartSenderJob().start();
  }

  private chartSenderJob() {
    return CronJob.from({
      cronTime: process.env.NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA as string,
      onTick: async () => {
        const subscribersUserIds =
          await this._nbuCurrencyBotUser.getSubscribersUserIds();
        const chart = await this._nbuRateBotChartBuilder.build();

        if (subscribersUserIds?.length) {
          const tasks = [];

          for (let i = 0; i < subscribersUserIds.length; i++) {
            const delay = 250 * i;

            tasks.push(
              new Promise(async (resolve) => {
                await new Promise((res) => setTimeout(res, delay));

                const result = await new Promise((r) => {
                  this._nbuRateBot.bot.api.sendPhoto(
                    subscribersUserIds[i].user_id,
                    new InputFile(chart),
                    {
                      parse_mode: 'HTML',
                      caption: createCaption(
                        this._nbuRateBot,
                        this._nbuRateBotChartBuilder.dates.startDate,
                        this._nbuRateBotChartBuilder.dates.endDate,
                        subscribersUserIds[i].lang,
                      ),
                    },
                  );

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

function createCaption(
  nbuRateBot: NBURateBot,
  startDate: string,
  endDate: string,
  lang: string,
) {
  return `<b>Weekly Chart</b>\n\n<code>${nbuRateBot.i18n.t(
    lang || DefaultLang,
    'nbu-exchange-bot-chart-period',
    {
      startDate: moment(startDate).format('YYYY.MM.DD'),
      endDate: moment(endDate).format('YYYY.MM.DD'),
    },
  )}</code>`;
}
