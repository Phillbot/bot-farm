import { inject, injectable } from 'inversify';
import { LanguageCode } from 'grammy/types';

import { BaseBot, ICommand } from '@telegram/common/base-bot';
import { LocalesDir } from '@telegram/common/symbols';

import {
  NBURateBotRateAllCommand,
  NBURateBotRateMainCommand,
  NBURateBotStartCommand,
  NBURateBotSubscribeCommand,
  NBURateBotUnsubscribeCommand,
} from './commands';
import { COMMANDS, NBURateBotUtils } from './nbu-rate.utils';
import { NBURateBotContext } from './nbu-rate.utils';
import { NbuBotToken, NbuDefaultLang, NbuSupportedLangs } from './symbols';

@injectable()
export class NBURateBot extends BaseBot<NBURateBotContext> {
  constructor(
    @inject(NbuBotToken.$) token: string,
    @inject(LocalesDir.$) localesDir: string,
    @inject(NbuSupportedLangs.$) supportedLangs: LanguageCode[],
    @inject(NbuDefaultLang.$) defaultLang: LanguageCode,
    @inject(NBURateBotStartCommand) nbuRateBotStartCommand: NBURateBotStartCommand,
    @inject(NBURateBotRateAllCommand) nbuRateBotRateAllCommand: NBURateBotRateAllCommand,
    @inject(NBURateBotRateMainCommand) nbuRateBotRateMainCommand: NBURateBotRateMainCommand,
    @inject(NBURateBotSubscribeCommand) nbuRateBotSubscribeCommand: NBURateBotSubscribeCommand,
    @inject(NBURateBotUnsubscribeCommand) nbuRateBotUnsubscribeCommand: NBURateBotUnsubscribeCommand,
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
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
      ),
      NBURateBot.createDescriptorsMap(),
      supportedLangs,
      defaultLang,
    );
  }

  private static createCommandsMap(
    startCommand: NBURateBotStartCommand,
    rateAllCommand: NBURateBotRateAllCommand,
    rateMainCommand: NBURateBotRateMainCommand,
    subscribeCommand: NBURateBotSubscribeCommand,
    unsubscribeCommand: NBURateBotUnsubscribeCommand,
  ): Map<string, { instance: ICommand }> {
    return new Map<string, { instance: ICommand }>([
      [COMMANDS.START, { instance: startCommand }],
      [COMMANDS.RATE, { instance: rateAllCommand }],
      [COMMANDS.RATE_MAIN, { instance: rateMainCommand }],
      [COMMANDS.SUBSCRIBE, { instance: subscribeCommand }],
      [COMMANDS.UNSUBSCRIBE, { instance: unsubscribeCommand }],
    ]);
  }

  private static createDescriptorsMap(): Map<string, string> {
    return new Map<string, string>([
      [COMMANDS.START, 'nbu-exchange-bot-start-command-descriptor'],
      [COMMANDS.RATE, 'nbu-exchange-bot-rate-command-descriptor'],
      [COMMANDS.RATE_MAIN, 'nbu-exchange-bot-rate-main-command-descriptor'],
      [COMMANDS.SUBSCRIBE, 'nbu-exchange-bot-subscribe-command-descriptor'],
      [COMMANDS.UNSUBSCRIBE, 'nbu-exchange-bot-unsubscribe-command-descriptor'],
    ]);
  }

  protected additionalMiddlewares(): void {
    this._composer.use(this._nbuRateBotUtils.tryUpdateUserLang);
  }
}
