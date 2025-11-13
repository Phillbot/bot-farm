import { CronJob } from 'cron';
import { inject, injectable } from 'inversify';
import { PrettyTable } from 'prettytable.js';

import { defaultTimeZone } from '@config/date.config';
import { LoggerToken } from '@config/symbols';

import { CronStatusRegistry } from '@helpers/cron-status.registry';
import { Logger } from '@helpers/logger';
import { PrettyTableCreator } from '@helpers/table-creator';

import { NBUCurrencyBotUserService } from '@database';
import { NBURateBot } from '@telegram';
import { TelegramUtils } from '@telegram/common/telegram-utils';
import { NBURateBotUtils, NBURateType, defaultLang, mainCurrencies } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { NbuBotCronConfigSymbol, NbuBotWebLink } from '@telegram/nbu-rate-bot/symbols';
import { NbuBotCronConfig } from '@telegram/nbu-rate-bot/types';

const NBU_DAILY_CRON_NAME = 'nbuDailyExchanges';

@injectable()
export class NBURateBotDailyExchangesJob {
  constructor(
    @inject(NbuBotCronConfigSymbol.$)
    private readonly _nbuBotCronConfig: NbuBotCronConfig,
    @inject(NbuBotWebLink.$)
    private readonly _nbuBotWebLink: string,
    private readonly _nbuCurrencyBotUserService: NBUCurrencyBotUserService,
    private readonly _prettyTableCreator: PrettyTableCreator,
    private readonly _nbuRateBot: NBURateBot,
    private readonly _nbuRateBotUtils: NBURateBotUtils,
    private readonly _telegramUtils: TelegramUtils,
    @inject(LoggerToken.$)
    private readonly _logger: Logger,
    private readonly _cronStatusRegistry: CronStatusRegistry,
  ) { }

  private exchangeTableSender(): CronJob {
    const job = CronJob.from({
      cronTime: this._nbuBotCronConfig.tableSchedule,
      onTick: async () => {
        this._cronStatusRegistry.markTick(NBU_DAILY_CRON_NAME);
        const subscribersUserIds = await this._nbuCurrencyBotUserService.getSubscribersUserIds();

        if (subscribersUserIds?.length) {
          const tasks = subscribersUserIds.map((subscriber, index) => {
            const delay = 250 * index;
            const lang = subscriber.lang ?? defaultLang;

            return new Promise(async (resolve) => {
              await new Promise((res) => setTimeout(res, delay));

              const table = await this.buildTable(lang);

              const adv = '';

              const message = this._telegramUtils.codeMessageCreator(
                table.toString(),
                `*${this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-automatic-exchange-message')}*\n\n${adv}\n\n`,
              );

              const result = await this._nbuRateBot.bot.api
                .sendMessage(subscriber.user_id, message, {
                  parse_mode: 'MarkdownV2',
                  link_preview_options: {
                    is_disabled: true,
                  },

                  reply_markup: this._telegramUtils.inlineKeyboardBuilder([
                    {
                      type: 'url',
                      text: this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-rates-url-text'),
                      url: this._nbuBotWebLink,
                    },
                  ]),
                })
                .catch((e) => this._logger.error('exchangeTableSender', e));

              resolve(result);
            });
          });

          Promise.all(tasks).catch((e) => this._logger.error(e));
        }
      },
      timeZone: this._nbuBotCronConfig.timezone ?? defaultTimeZone,
    });

    job.start();
    this._cronStatusRegistry.setRunning(NBU_DAILY_CRON_NAME, job.running);

    return job;
  }

  private async buildTable(lang: string): Promise<PrettyTable> {
    const { data } = await this._nbuRateBotUtils.getNBUExchangeRate();
    const filteredData = data?.filter(({ cc }) => mainCurrencies.some((c) => c === cc));

    const table = await this._prettyTableCreator.builder<NBURateType>({
      data: filteredData,
      type: 'with-header',
      headerKeys: new Map([
        ['cc', this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-rates-table-cc')],
        ['rate', this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-rates-table-rate')],
        ['exchangedate', this._nbuRateBot.i18n.t(lang, 'nbu-exchange-bot-exchange-date')],
      ]),
    });

    return table;
  }

  public start() {
    this.exchangeTableSender();
  }
}
