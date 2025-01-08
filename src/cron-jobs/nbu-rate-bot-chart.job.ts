import { inject, injectable } from 'inversify';
import { CronJob } from 'cron';
import { InputFile } from 'grammy';

import { NBUCurrencyBotUserService } from '@database';

import { Logger } from '@helpers/logger';
import { defaultTimeZone } from '@config/date.config';

import { NBURateBot } from '@telegram';
import { TelegramUtils } from '@telegram/common/telegram-utils';
import { NbuBotCronChartSchema, NbuBotCronTimezone } from '@telegram/nbu-rate-bot/symbols';
import { NBUChartPeriod, NBURateBotChartBuilder } from '@telegram/nbu-rate-bot/nbu-rate-chart-builder.service';
import { defaultLang } from '@telegram/nbu-rate-bot/nbu-rate.utils';

@injectable()
export class NBURateBotChartJob {
  constructor(
    @inject(NbuBotCronChartSchema.$)
    private readonly _nbuBotCronChartSchema: string,
    @inject(NbuBotCronTimezone.$)
    private readonly _nbuBotCronTimezone: string,
    @inject('Factory<NBURateBotChartBuilder>')
    private _nbuRateBotChartBuilder: (
      startDate: string,
      endDate: string,
      type: NBUChartPeriod,
    ) => NBURateBotChartBuilder,
    private readonly _nbuCurrencyBotUserService: NBUCurrencyBotUserService,
    private readonly _nbuRateBot: NBURateBot,
    private readonly _telegramUtils: TelegramUtils,
    private readonly _logger: Logger,
  ) {}

  private useBotChartBuilderFactory() {
    const { startDate, endDate } = this.dateConfig;

    const instance = this._nbuRateBotChartBuilder(startDate, endDate, 'month');
    return instance.build();
  }

  private chartSenderJob(): void {
    return CronJob.from({
      cronTime: this._nbuBotCronChartSchema,
      onTick: async () => {
        const subscribersUserIds = await this._nbuCurrencyBotUserService.getSubscribersUserIds();

        if (subscribersUserIds?.length) {
          const chart = await this.useBotChartBuilderFactory();
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
    const { startDate, endDate } = this.dateConfig;

    return this._telegramUtils.simpleCodeMessageCreator(
      this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-chart-period', {
        startDate: new Date(
          startDate.slice(0, 4) + '-' + startDate.slice(4, 6) + '-' + startDate.slice(6),
        ).toLocaleDateString('uk-UA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        endDate: new Date(endDate.slice(0, 4) + '-' + endDate.slice(4, 6) + '-' + endDate.slice(6)).toLocaleDateString(
          'uk-UA',
          { year: 'numeric', month: '2-digit', day: '2-digit' },
        ),
      }),
      `*${this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-weekly-chart')}*\n\n`,
    );
  }

  private get dateConfig() {
    const startDate = new Date(new Date().toLocaleString('en-US', { timeZone: defaultTimeZone }));
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date(new Date().toLocaleString('en-US', { timeZone: defaultTimeZone }));
    return {
      startDate: startDate.toISOString().slice(0, 10).replace(/-/g, ''),
      endDate: endDate.toISOString().slice(0, 10).replace(/-/g, ''),
    };
  }

  public start(): void {
    this.chartSenderJob();
  }
}
