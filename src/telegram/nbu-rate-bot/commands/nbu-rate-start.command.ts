import { CommandContext } from 'grammy';
import { injectable } from 'inversify';

import { NBUCurrencyBotUserService } from '@database';
import { TelegramUtils } from '@telegram/common/telegram-utils';

import { NBURateBotContext, defaultLang } from '../nbu-rate.utils';

@injectable()
export class NBURateBotStartCommand {
  constructor(
    private readonly _nbuCurrencyBotUserService: NBUCurrencyBotUserService,
    private readonly _telegramUtils: TelegramUtils,
  ) { }

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    if (!ctx.from?.id) {
      return;
    }

    if (!ctx?.dataValues) {
      await this._nbuCurrencyBotUserService.createUser({
        user_id: ctx.from.id,
        user_name: ctx.from?.username,
        is_subscribe_active: false,
        lang: ctx.from.language_code ?? defaultLang,
      });
    }

    await this._telegramUtils.sendReply({
      ctx,
      text: ctx.t('nbu-exchange-bot-start', { firstName: ctx.from.first_name }),
    });
  }
}
