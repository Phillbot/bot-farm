import { inject, injectable } from 'inversify';
import { LanguageCode } from 'grammy/types';

import { AbstractBaseBot, ICommand } from '@telegram/common/base-bot';
import { LocalesDir } from '@telegram/common/symbols';
import { Logger } from '@helpers/logger';

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
    nbuRateBotStartCommand: NBURateBotStartCommand,
    nbuRateBotRateAllCommand: NBURateBotRateAllCommand,
    nbuRateBotRateMainCommand: NBURateBotRateMainCommand,
    nbuRateBotSubscribeCommand: NBURateBotSubscribeCommand,
    nbuRateBotUnsubscribeCommand: NBURateBotUnsubscribeCommand,
    nbuRateBotBarYearChartCommand: NBURateBotBarChartCommand,
    logger: Logger,
    private readonly _nbuRateBotUtils: NBURateBotUtils,
  ) {
    super(
      token,
      defaultLang,
      localesDir,
      NBURateBot.createCommandsMap(
        nbuRateBotStartCommand,
        nbuRateBotRateAllCommand,
        nbuRateBotRateMainCommand,
        nbuRateBotSubscribeCommand,
        nbuRateBotUnsubscribeCommand,
        nbuRateBotBarYearChartCommand,
      ),
      NBURateBot.createDescriptorsMap(),
      supportedLangs,
      defaultLang,
      logger,
    );
  }

  private static createCommandsMap(
    startCommand: NBURateBotStartCommand,
    rateAllCommand: NBURateBotRateAllCommand,
    rateMainCommand: NBURateBotRateMainCommand,
    subscribeCommand: NBURateBotSubscribeCommand,
    unsubscribeCommand: NBURateBotUnsubscribeCommand,
    chartCommand: NBURateBotBarChartCommand,
  ): Map<string, { instance: ICommand }> {
    return new Map<string, { instance: ICommand }>([
      [COMMANDS.START, { instance: startCommand }],
      [COMMANDS.RATE, { instance: rateAllCommand }],
      [COMMANDS.RATE_MAIN, { instance: rateMainCommand }],
      [COMMANDS.SUBSCRIBE, { instance: subscribeCommand }],
      [COMMANDS.UNSUBSCRIBE, { instance: unsubscribeCommand }],
      [COMMANDS.CHART, { instance: chartCommand }],
    ]);
  }

  private static createDescriptorsMap(): Map<string, string> {
    return new Map<string, string>([
      [COMMANDS.START, 'nbu-exchange-bot-start-command-descriptor'],
      [COMMANDS.RATE, 'nbu-exchange-bot-rate-command-descriptor'],
      [COMMANDS.RATE_MAIN, 'nbu-exchange-bot-rate-main-command-descriptor'],
      [COMMANDS.SUBSCRIBE, 'nbu-exchange-bot-subscribe-command-descriptor'],
      [COMMANDS.UNSUBSCRIBE, 'nbu-exchange-bot-unsubscribe-command-descriptor'],
      [COMMANDS.CHART, 'nbu-exchange-bot-chart-command-descriptor'],
    ]);
  }

  protected additionalMiddlewares(): void {
    this._composer.use(this._nbuRateBotUtils.tryUpdateUserLang);
  }
}
