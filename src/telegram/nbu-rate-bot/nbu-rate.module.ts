import { NBURateBotChartJob, NBURateBotDailyExchangesJob } from 'cron-jobs';
import { LanguageCode } from 'grammy/types';
import { ContainerModule, interfaces } from 'inversify';

import { getNbuConfigOrThrow } from '@config/environment';
import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import {
  NBURateBotBarChartCommand,
  NBURateBotRateAllCommand,
  NBURateBotRateMainCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from '@telegram/nbu-rate-bot/commands';
import { NBURateBotUtils } from '@telegram/nbu-rate-bot/nbu-rate.utils';

import { NBUChartPeriod, NBURateBotChartBuilder } from './nbu-rate-chart-builder.service';
import { NBURateBot } from './nbu-rate.bot';
import { defaultLang, supportedLangs } from './nbu-rate.utils';
import {
  NbuBotApiUrl,
  NbuBotApiUrlByDate,
  NbuBotCronConfigSymbol,
  NbuBotCurrencies,
  NbuBotDefaultLang,
  NbuBotSupportedLangs,
  NbuBotToken,
  NbuBotWebLink,
} from './symbols';
import { NbuBotCronConfig } from './types';

export const nbuRateBotModule = new ContainerModule((bind: interfaces.Bind) => {
  const nbuConfig = getNbuConfigOrThrow();

  bind<string>(NbuBotToken.$).toConstantValue(nbuConfig.botToken);
  bind<string>(NbuBotApiUrl.$).toConstantValue(nbuConfig.apiUrl);
  bind<string>(NbuBotApiUrlByDate.$).toConstantValue(nbuConfig.apiUrlByDate);
  bind<string>(NbuBotWebLink.$).toConstantValue(nbuConfig.webLink);
  bind<string>(NbuBotCurrencies.$).toConstantValue(nbuConfig.currencies);

  bind<NbuBotCronConfig>(NbuBotCronConfigSymbol.$).toConstantValue({
    tableSchedule: nbuConfig.cronTableSchema,
    chartSchedule: nbuConfig.cronChartSchema,
    timezone: nbuConfig.cronTimezone,
  });

  bind<LanguageCode[]>(NbuBotSupportedLangs.$).toConstantValue(supportedLangs);
  bind<LanguageCode>(NbuBotDefaultLang.$).toConstantValue(defaultLang);

  bind<NBURateBot>(NBURateBot).toSelf();
  bind<NBURateBotUtils>(NBURateBotUtils).toSelf();
  bind<NBURateBotStartCommand>(NBURateBotStartCommand).toSelf();
  bind<NBURateBotRateAllCommand>(NBURateBotRateAllCommand).toSelf();
  bind<NBURateBotRateMainCommand>(NBURateBotRateMainCommand).toSelf();
  bind<NBURateBotSubscribeCommand>(NBURateBotSubscribeCommand).toSelf();
  bind<NBURateBotUnsubscribeCommand>(NBURateBotUnsubscribeCommand).toSelf();
  bind<NBURateBotBarChartCommand>(NBURateBotBarChartCommand).toSelf();

  bind<interfaces.Factory<NBURateBotChartBuilder>>('Factory<NBURateBotChartBuilder>').toFactory<NBURateBotChartBuilder>(
    (ctx: interfaces.Context) => (startDate, endDate, period) =>
      new NBURateBotChartBuilder(
        ctx.container.get<string>(NbuBotCurrencies.$),
        ctx.container.get<Logger>(LoggerToken.$),
        ctx.container.get<NBURateBotUtils>(NBURateBotUtils),
        startDate as string,
        endDate as string,
        period as NBUChartPeriod,
      ),
  );

  bind<NBURateBotChartJob>(NBURateBotChartJob).toSelf();
  bind<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob).toSelf();
});
