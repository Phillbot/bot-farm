import { inject, injectable } from 'inversify';
import { CommandContext } from 'grammy';

import { TelegramUtils } from '@telegram/common/telegram-utils';
import { ReactClickerBotContext } from '../react-clicker.utils';

@injectable()
export class ReactClickerBotPlayCommand {
  constructor(@inject(TelegramUtils) private readonly _telegramUtils: TelegramUtils) {}

  public async withCtx(ctx: CommandContext<ReactClickerBotContext>): Promise<void> {
    await this._telegramUtils.sendReply({
      ctx,
      text: ctx.t('nbu-exchange-bot-start', { firstName: ctx.from?.first_name ?? '' }),
      reply_markup: this._telegramUtils.inlineKeyboardBuilder([
        {
          type: 'web_app',
          text: ctx.t('nbu-exchange-bot-exchange-rates-url-text'),
          url: process.env.REACT_CLICKER_BOT_GAME_URL!,
        },
      ]),
    });
  }
}
