import { CommandContext } from 'grammy';
import { injectable } from 'inversify';

import { TelegramUtils } from '@telegram/common/telegram-utils';
import { ReactClickerBotContext } from '../react-clicker.utils';

@injectable()
export class ReactClickerBotStartCommand {
  constructor(private _telegramUtils: TelegramUtils) {}

  public async withCtx(ctx: CommandContext<ReactClickerBotContext>): Promise<void> {
    await this._telegramUtils.sendReply({
      ctx,
      text: ctx.t('react-clicker-bot-start-command', { firstName: ctx.from?.first_name ?? '' }),
    });
  }
}
