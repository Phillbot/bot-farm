import { injectable } from 'inversify';
import { CommandContext, Context } from 'grammy';
import { ParseMode } from 'grammy/types';
import { t } from 'config/i18.config';

@injectable()
export class TelegramUtils {
  public sendReply<T extends Context>(
    ctx: CommandContext<T>,
    text: string,
    parse_mode?: ParseMode | undefined,
  ) {
    t.setLocale(ctx.from?.language_code || 'en');

    ctx
      .reply(text, {
        parse_mode: parse_mode,
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(ctx.me, error);
      })
      // collect logs?
      // eslint-disable-next-line
      .finally(() => console.log(ctx.me, ctx.message));
  }
}
