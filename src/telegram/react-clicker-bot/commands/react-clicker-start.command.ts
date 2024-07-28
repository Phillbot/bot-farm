import { CommandContext } from 'grammy';
import { inject, injectable } from 'inversify';

import { TelegramUtils } from '@telegram/common/telegram-utils';
import { ReactClickerBotContext } from '../react-clicker.utils';

@injectable()
export class ReactClickerBotStartCommand {
  constructor(@inject(TelegramUtils) private _telegramUtils: TelegramUtils) {}

  public async withCtx(ctx: CommandContext<ReactClickerBotContext>): Promise<void> {
    await this._telegramUtils.sendReply({
      ctx,
      text: ctx.t('nbu-exchange-bot-start', { firstName: ctx.from?.first_name ?? '' }),
    });
  }
}
