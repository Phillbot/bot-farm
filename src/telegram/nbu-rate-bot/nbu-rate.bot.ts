import { LanguageCode } from 'grammy/types';
import { inject, injectable } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { AbstractBaseBot } from '@telegram/common/base-bot';
import { CommandDefinition } from '@telegram/common/base-bot/types';
import { LocalesDir } from '@telegram/common/symbols';

import {
  NBURateBotBarChartCommand,
  NBURateBotRateAllCommand,
  NBURateBotRateMainCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from './commands';
import { COMMANDS, NBURateBotUtils } from './nbu-rate.utils';
import { NBURateBotContext } from './nbu-rate.utils';
import { NbuBotDefaultLang, NbuBotSupportedLangs, NbuBotToken } from './symbols';

@injectable()
export class NBURateBot extends AbstractBaseBot<NBURateBotContext> {
  constructor(
    @inject(NbuBotToken.$) token: string,
    @inject(LocalesDir.$) localesDir: string,
    @inject(NbuBotSupportedLangs.$) supportedLangs: LanguageCode[],
    @inject(NbuBotDefaultLang.$) defaultLang: LanguageCode,
    @inject(LoggerToken.$) logger: Logger,
    nbuRateBotStartCommand: NBURateBotStartCommand,
    nbuRateBotRateAllCommand: NBURateBotRateAllCommand,
    nbuRateBotRateMainCommand: NBURateBotRateMainCommand,
    nbuRateBotSubscribeCommand: NBURateBotSubscribeCommand,
    nbuRateBotUnsubscribeCommand: NBURateBotUnsubscribeCommand,
    nbuRateBotBarYearChartCommand: NBURateBotBarChartCommand,
    private readonly _nbuRateBotUtils: NBURateBotUtils,
  ) {
    super({
      token,
      defaultLocale: defaultLang,
      localesDir,
      commands: NBURateBot.createCommandDefinitions(
        nbuRateBotStartCommand,
        nbuRateBotRateAllCommand,
        nbuRateBotRateMainCommand,
        nbuRateBotSubscribeCommand,
        nbuRateBotUnsubscribeCommand,
        nbuRateBotBarYearChartCommand,
      ),
      supportedLangs,
      logger,
    });
  }

  private static createCommandDefinitions(
    startCommand: NBURateBotStartCommand,
    rateAllCommand: NBURateBotRateAllCommand,
    rateMainCommand: NBURateBotRateMainCommand,
    subscribeCommand: NBURateBotSubscribeCommand,
    unsubscribeCommand: NBURateBotUnsubscribeCommand,
    chartCommand: NBURateBotBarChartCommand,
  ): CommandDefinition[] {
    return [
      {
        command: COMMANDS.START,
        handler: startCommand,
        descriptionKey: 'nbu-exchange-bot-start-command-descriptor',
      },
      {
        command: COMMANDS.RATE,
        handler: rateAllCommand,
        descriptionKey: 'nbu-exchange-bot-rate-command-descriptor',
      },
      {
        command: COMMANDS.RATE_MAIN,
        handler: rateMainCommand,
        descriptionKey: 'nbu-exchange-bot-rate-main-command-descriptor',
      },
      {
        command: COMMANDS.SUBSCRIBE,
        handler: subscribeCommand,
        descriptionKey: 'nbu-exchange-bot-subscribe-command-descriptor',
      },
      {
        command: COMMANDS.UNSUBSCRIBE,
        handler: unsubscribeCommand,
        descriptionKey: 'nbu-exchange-bot-unsubscribe-command-descriptor',
      },
      {
        command: COMMANDS.CHART,
        handler: chartCommand,
        descriptionKey: 'nbu-exchange-bot-chart-command-descriptor',
      },
    ];
  }

  protected additionalMiddlewares(): void {
    this._composer.use(this._nbuRateBotUtils.tryUpdateUserLang);
  }
}
