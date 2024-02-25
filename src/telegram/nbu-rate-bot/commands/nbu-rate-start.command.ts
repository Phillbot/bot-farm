import { CommandContext } from 'grammy';
import { inject, injectable } from 'inversify';

import { TelegramUtils } from '@telegram/telegram-utils';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';

import { NBURateBotContext } from '../nbu-rate.bot';
import { defaultLang } from '../nbu-rate.utils';

@injectable()
export class NBURateBotStartCommand {
  constructor(
    @inject(NBUCurrencyBotUser) private _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(TelegramUtils) private _telegramUtils: TelegramUtils,
  ) {}

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    if (!ctx.from?.id) {
      return;
    }

    const isUserExist = ctx?.dataValues;

    if (!isUserExist) {
      await this._nbuCurrencyBotUser.createUser({
        user_id: ctx.from.id,
        user_name: ctx.from?.username,
        is_subscribe_active: false,
        lang: ctx.from.language_code || defaultLang,
      });
    }

    await this._telegramUtils.sendReply({
      ctx,
      text: ctx.t('nbu-exchange-bot-start', { firstName: ctx.from.first_name }),
    });
  }
}
