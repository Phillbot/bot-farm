import moment from 'moment';
import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';
import { InputFile } from 'grammy';

import { NBUCurrencyBotUserService } from '@database/index';
import { Logger } from '@helpers/logger';

import { NBURateBot } from '@telegram/index';
import { TelegramUtils } from '@telegram/common/telegram-utils';
import { defaultLang } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { NbuBotCronChartSchema, NbuBotCronTimezone } from '@telegram/nbu-rate-bot/symbols';
import { NBURateBotChartBuilder } from '@telegram/nbu-rate-bot/nbu-rate-chart-builder.service';

import { defaultTimeZone } from './utils';

@injectable()
export class NBURateBotChartJob {
  //TODO: Move config to ENV for abstract?
  private readonly _startDate = moment().subtract(1, 'month').format('YYYYMMDD');
  private readonly _endDate = moment().format('YYYYMMDD');
  private readonly _displayFormat = 'DD.MM.YYYY';

  constructor(
    @inject(NbuBotCronChartSchema.$) private readonly _nbuBotCronChartSchema: string,
    @inject(NbuBotCronTimezone.$) private readonly _nbuBotCronTimezone: string,
    @inject(NBUCurrencyBotUserService) private readonly _nbuCurrencyBotUserService: NBUCurrencyBotUserService,
    @inject(NBURateBot) private readonly _nbuRateBot: NBURateBot,
    @inject(NBURateBotChartBuilder) private readonly _nbuRateBotChartBuilder: NBURateBotChartBuilder,
    @inject(TelegramUtils) private readonly _telegramUtils: TelegramUtils,
    @inject(Logger) private readonly _logger: Logger,
  ) {
    this._nbuRateBotChartBuilder.setDates(this._startDate, this._endDate);
  }

  private chartSenderJob(): void {
    return CronJob.from({
      cronTime: this._nbuBotCronChartSchema,
      onTick: async () => {
        const subscribersUserIds = await this._nbuCurrencyBotUserService.getSubscribersUserIds();

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
                    .catch((e) => this._logger.error('chartSenderJob', e));
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
