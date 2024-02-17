import { CommandContext } from 'grammy';
import { inject, injectable } from 'inversify';

import { TelegramUtils } from '@telegram/telegram-utils';
import { NBUCurrencyBotUser } from '@database/nbu-rate-bot-user.entity';

import { DefaultLang } from '../helpers/nbu-utils';
import { NBURateBotContext } from '../nbu-rate.bot';

@injectable()
export class NBURateBotStartCommand {
  constructor(
    @inject(NBUCurrencyBotUser) private _nbuCurrencyBotUser: NBUCurrencyBotUser,
    @inject(TelegramUtils) private _telegramUtils: TelegramUtils,
  ) {}

  public async withCtx(ctx: CommandContext<NBURateBotContext>) {
    if (!ctx.from?.id) {
      return;
    }

    const user = await this._nbuCurrencyBotUser.getUserById(ctx.from.id);

    const isUserExist = user?.dataValues;

    if (!isUserExist) {
      await this._nbuCurrencyBotUser.createUser(
        ctx.from.id,
        false,
        ctx.from.language_code || DefaultLang,
        ctx.from?.username,
      );
    }

    await this._telegramUtils.sendReply(
      ctx,
      ctx.t('nbu-exchange-bot-start', { firstName: ctx.from.first_name }),
    );
  }
}
