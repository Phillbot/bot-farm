import { ContainerModule, interfaces } from 'inversify';
import { LanguageCode } from 'grammy/types';
import {
  NBURateBotRateAllCommand,
  NBURateBotRateMainCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from '@telegram/nbu-rate-bot/commands';
import { NBURateBotUtils } from '@telegram/nbu-rate-bot/nbu-rate.utils';

import { Logger } from '@helpers/logger';

import { NBURateBotChartJob, NBURateBotDailyExchangesJob } from 'cron-jobs';

import { NBURateBot } from './nbu-rate.bot';
import { defaultLang, supportedLangs } from './nbu-rate.utils';
import {
  NbuBotApiUrl,
  NbuBotApiUrlByDate,
  NbuBotCronChartSchema,
  NbuBotCronTableSchema,
  NbuBotCronTimezone,
  NbuBotCurrencies,
  NbuBotDefaultLang,
  NbuBotSupportedLangs,
  NbuBotToken,
  NbuBotWebLink,
} from './symbols';
import { NBURateBotChartBuilder } from './nbu-rate-chart-builder.service';

export const nbuRateBotModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<string>(NbuBotToken.$).toConstantValue(process.env.NBU_RATE_EXCHANGE_BOT_TOKEN!);
  bind<string>(NbuBotApiUrl.$).toConstantValue(process.env.NBU_RATE_EXCHANGE_API_URL!);
  bind<string>(NbuBotApiUrlByDate.$).toConstantValue(process.env.NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL!);
  bind<string>(NbuBotWebLink.$).toConstantValue(process.env.NBU_RATE_EXCHANGE_WEB_LINK!);
  bind<string>(NbuBotCurrencies.$).toConstantValue(process.env.NBU_RATE_EXCHANGE_CURRENCIES!);

  // TODO: create cron module?
  bind<string>(NbuBotCronTableSchema.$).toConstantValue(process.env.NBU_RATE_EXCHANGE_CURRENCY_TABLE_CRON_SCHEMA!);
  bind<string>(NbuBotCronChartSchema.$).toConstantValue(process.env.NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA!);
  bind<string>(NbuBotCronTimezone.$).toConstantValue(process.env.NBU_RATE_EXCHANGE_CRON_TIMEZONE!);

  bind<LanguageCode[]>(NbuBotSupportedLangs.$).toConstantValue(supportedLangs);
  bind<LanguageCode>(NbuBotDefaultLang.$).toConstantValue(defaultLang);

  bind<NBURateBot>(NBURateBot).toSelf();
  bind<NBURateBotUtils>(NBURateBotUtils).toSelf();
  bind<NBURateBotStartCommand>(NBURateBotStartCommand).toSelf();
  bind<NBURateBotRateAllCommand>(NBURateBotRateAllCommand).toSelf();
  bind<NBURateBotRateMainCommand>(NBURateBotRateMainCommand).toSelf();
  bind<NBURateBotSubscribeCommand>(NBURateBotSubscribeCommand).toSelf();
  bind<NBURateBotUnsubscribeCommand>(NBURateBotUnsubscribeCommand).toSelf();

  bind<interfaces.Factory<NBURateBotChartBuilder>>('Factory<NBURateBotChartBuilder>').toFactory<NBURateBotChartBuilder>(
    (ctx: interfaces.Context) => (startDate, endDate) =>
      new NBURateBotChartBuilder(
        ctx.container.get<string>(NbuBotCurrencies.$),
        ctx.container.get<Logger>(Logger),
        ctx.container.get<NBURateBotUtils>(NBURateBotUtils),
        startDate as string,
        endDate as string,
      ),
  );

  bind<NBURateBotChartJob>(NBURateBotChartJob).toSelf();
  bind<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob).toSelf();
});
