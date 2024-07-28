import moment from 'moment';
import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';
import { InputFile } from 'grammy';

import { NBURateBot } from '@telegram/index';
import { TelegramUtils } from '@telegram/common/telegram-utils';
import { defaultLang } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { NBURateBotChartBuilder } from '@telegram/nbu-rate-bot/nbu-rate-chart-builder.service';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { Logger } from '@helpers/logger';

import { nbuRateBotTimezone } from './utils';

@injectable()
export class NBURateBotChartJob {
  //TODO: Move config to ENV for abstract?
  private readonly _startDate = moment().subtract(1, 'month').format('YYYYMMDD');
  private readonly _endDate = moment().format('YYYYMMDD');
  private readonly _displayFormat = 'DD.MM.YYYY';

  constructor(
    @inject(NBUCurrencyBotUser) private readonly _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(NBURateBot) private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotChartBuilder) private readonly _nbuRateBotChartBuilder: NBURateBotChartBuilder,
    @inject(TelegramUtils) private readonly _telegramUtils: TelegramUtils,
  ) {
    this._nbuRateBotChartBuilder.setDates(this._startDate, this._endDate);
  }

  private chartSenderJob(): void {
    return CronJob.from({
      cronTime: process.env.NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA!,
      onTick: async () => {
        const subscribersUserIds = await this._nbuCurrencyBotUser.getSubscribersUserIds();

        if (subscribersUserIds?.length) {
          const chart = await this._nbuRateBotChartBuilder.build();
          const tasks = [];

          for (let i = 0; i < subscribersUserIds.length; i++) {
            const delay = 250 * i;

            tasks.push(
              new Promise(async (resolve) => {
                await new Promise((res) => setTimeout(res, delay));

                const result = await new Promise((r) => {
                  this._nbuRateBot.bot.api
                    .sendPhoto(subscribersUserIds[i].user_id, new InputFile(chart), {
                      parse_mode: 'MarkdownV2',
                      caption: this.createCaption(subscribersUserIds[i].lang ?? defaultLang),
                    })
                    .catch((e) => Logger.error('chartSenderJob', e));
                  r(delay);
                });

                resolve(result);
              }),
            );
          }
          Promise.all(tasks).catch((e) => Logger.error(e));
        }
      },
      timeZone: nbuRateBotTimezone,
    }).start();
  }

  private createCaption(lang: string): string {
    return this._telegramUtils.simpleCodeMessageCreator(
      this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-chart-period', {
        startDate: moment(this._startDate).format(this._displayFormat),
        endDate: moment(this._endDate).format(this._displayFormat),
      }),
      `*${this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-weekly-chart')}*\n\n`,
    );
  }

  public start(): void {
    this.chartSenderJob();
  }
}
