import { ContainerModule, interfaces } from 'inversify';
import { LanguageCode } from 'grammy/types';
import { environment } from '@config/environment';
import {
  NBURateBotBarChartCommand,
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
import { NBUChartPeriod, NBURateBotChartBuilder } from './nbu-rate-chart-builder.service';

export const nbuRateBotModule = new ContainerModule((bind: interfaces.Bind) => {
  const nbuConfig = environment.nbu;

  bind<string>(NbuBotToken.$).toConstantValue(nbuConfig.botToken);
  bind<string>(NbuBotApiUrl.$).toConstantValue(nbuConfig.apiUrl);
  bind<string>(NbuBotApiUrlByDate.$).toConstantValue(nbuConfig.apiUrlByDate);
  bind<string>(NbuBotWebLink.$).toConstantValue(nbuConfig.webLink);
  bind<string>(NbuBotCurrencies.$).toConstantValue(nbuConfig.currencies);

  // TODO: create cron module?
  bind<string>(NbuBotCronTableSchema.$).toConstantValue(nbuConfig.cronTableSchema);
  bind<string>(NbuBotCronChartSchema.$).toConstantValue(nbuConfig.cronChartSchema);
  bind<string>(NbuBotCronTimezone.$).toConstantValue(nbuConfig.cronTimezone);

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
        ctx.container.get<Logger>(Logger),
        ctx.container.get<NBURateBotUtils>(NBURateBotUtils),
        startDate as string,
        endDate as string,
        period as NBUChartPeriod,
      ),
  );

  bind<NBURateBotChartJob>(NBURateBotChartJob).toSelf();
  bind<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob).toSelf();
});
