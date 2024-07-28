import { ContainerModule, interfaces } from 'inversify';
import { LanguageCode } from 'grammy/types';

import {
  NBURateBotRateAllCommand,
  NBURateBotRateMainCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from '@telegram/nbu-rate-bot/commands';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { NBURateBotUtils } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { NBURateBotPostgresqlSequelize } from '@database/nbu-rate-bot.db';
import { NBURateBotChartJob, NBURateBotDailyExchangesJob } from 'cron-jobs';

import { NBURateBot } from './nbu-rate.bot';
import { defaultLang, supportedLangs } from './nbu-rate.utils';
import { NbuBotToken, NbuDefaultLang, NbuSupportedLangs } from './symbols';
import { NBURateBotChartBuilder } from './nbu-rate-chart-builder.service';

export const nbuRateBotModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<string>(NbuBotToken.$).toConstantValue(process.env.NBU_RATE_BOT_TOKEN!);
  bind<LanguageCode[]>(NbuSupportedLangs.$).toConstantValue(supportedLangs);
  bind<LanguageCode>(NbuDefaultLang.$).toConstantValue(defaultLang);

  bind<NBURateBot>(NBURateBot).toSelf();
  bind<NBUCurrencyBotUser>(NBUCurrencyBotUser).toSelf();
  bind<NBURateBotUtils>(NBURateBotUtils).toSelf();
  bind<NBURateBotStartCommand>(NBURateBotStartCommand).toSelf();
  bind<NBURateBotRateAllCommand>(NBURateBotRateAllCommand).toSelf();
  bind<NBURateBotRateMainCommand>(NBURateBotRateMainCommand).toSelf();
  bind<NBURateBotSubscribeCommand>(NBURateBotSubscribeCommand).toSelf();
  bind<NBURateBotUnsubscribeCommand>(NBURateBotUnsubscribeCommand).toSelf();
  bind<NBURateBotChartBuilder>(NBURateBotChartBuilder).toSelf();
  bind<NBURateBotPostgresqlSequelize>(NBURateBotPostgresqlSequelize).toSelf();
  bind<NBURateBotChartJob>(NBURateBotChartJob).toSelf();
  bind<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob).toSelf();
});
