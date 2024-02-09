import 'reflect-metadata';
import { Container } from 'inversify';

import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { NBURateBotUtils } from '@telegram/nbu-rate/helpers/nbu-utils';
import { TelegramUtils } from '@telegram/telegram-utils';

import { NBURateBotChartBuilder } from '@telegram/nbu-rate/helpers/chart-builder.service';
import { NBURateBotPostgresqlSequelize } from '@database/nbu-rate-bot.db';

import { NBURateBotChartJob, NBURateBotDailyExchangesJob } from 'cron-jobs';
import {
  NBURateBotRateCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from '@telegram/nbu-rate/commands';

import { NBURateBot } from '../telegram';

const container = new Container({ defaultScope: 'Singleton' });
container.bind<NBURateBot>(NBURateBot).toSelf();

container.bind<TelegramUtils>(TelegramUtils).toSelf();

container.bind<NBUCurrencyBotUser>(NBUCurrencyBotUser).toSelf();
container.bind<NBURateBotUtils>(NBURateBotUtils).toSelf();

container.bind<NBURateBotStartCommand>(NBURateBotStartCommand).toSelf();
container.bind<NBURateBotRateCommand>(NBURateBotRateCommand).toSelf();
container.bind<NBURateBotSubscribeCommand>(NBURateBotSubscribeCommand).toSelf();
container
  .bind<NBURateBotUnsubscribeCommand>(NBURateBotUnsubscribeCommand)
  .toSelf();

container.bind<NBURateBotChartBuilder>(NBURateBotChartBuilder).toSelf();

container.bind<NBURateBotChartJob>(NBURateBotChartJob).toSelf();
container
  .bind<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob)
  .toSelf();
container
  .bind<NBURateBotPostgresqlSequelize>(NBURateBotPostgresqlSequelize)
  .toSelf();

export default container;
