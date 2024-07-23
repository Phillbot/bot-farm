import { Container } from 'inversify';

import { NBURateBotChartJob, NBURateBotDailyExchangesJob } from 'cron-jobs';

import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';
import { NBURateBotUtils } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { TelegramUtils } from '@telegram/common/telegram-utils';
import { NBURateBotChartBuilder } from '@telegram/nbu-rate-bot/nbu-rate-chart-builder.service';
import { NBURateBotPostgresqlSequelize } from '@database/nbu-rate-bot.db';
import { NBURateBot } from '@telegram/index';
import {
  NBURateBotRateAllCommand,
  NBURateBotRateMainCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from '@telegram/nbu-rate-bot/commands';
import { PrettyTableCreator } from '@helpers/table-creator';
import { GlobalUtils } from '@helpers/global-utils';
import { ExpressApp } from '@server/express-server';
import { ReactClickerBotPlayCommand, ReactClickerBotStartCommand } from '@telegram/react-clicker-bot/commands';
import { ReactClickerBot } from '@telegram/react-clicker-bot/react-clicker.bot';

const container = new Container({ defaultScope: 'Singleton' });

container.bind<ExpressApp>(ExpressApp).toSelf();

container.bind<PrettyTableCreator>(PrettyTableCreator).toSelf();
container.bind<GlobalUtils>(GlobalUtils).toSelf();
container.bind<TelegramUtils>(TelegramUtils).toSelf();

container.bind<NBURateBot>(NBURateBot).toSelf();
container.bind<NBUCurrencyBotUser>(NBUCurrencyBotUser).toSelf();
container.bind<NBURateBotUtils>(NBURateBotUtils).toSelf();
container.bind<NBURateBotStartCommand>(NBURateBotStartCommand).toSelf();
container.bind<NBURateBotRateAllCommand>(NBURateBotRateAllCommand).toSelf();
container.bind<NBURateBotRateMainCommand>(NBURateBotRateMainCommand).toSelf();
container.bind<NBURateBotSubscribeCommand>(NBURateBotSubscribeCommand).toSelf();
container.bind<NBURateBotUnsubscribeCommand>(NBURateBotUnsubscribeCommand).toSelf();
container.bind<NBURateBotChartBuilder>(NBURateBotChartBuilder).toSelf();

container.bind<NBURateBotPostgresqlSequelize>(NBURateBotPostgresqlSequelize).toSelf();

container.bind<NBURateBotChartJob>(NBURateBotChartJob).toSelf();
container.bind<NBURateBotDailyExchangesJob>(NBURateBotDailyExchangesJob).toSelf();

container.bind<ReactClickerBot>(ReactClickerBot).toSelf();

container.bind<ReactClickerBotStartCommand>(ReactClickerBotStartCommand).toSelf();
container.bind<ReactClickerBotPlayCommand>(ReactClickerBotPlayCommand).toSelf();

export default container;
