import { CommandContext, Context } from 'grammy';
import { ParseMode } from 'grammy/types';

export class TelegramUtils {
  public static sendReply<T extends Context>(
    ctx: CommandContext<T>,
    text: string,
    parse_mode?: ParseMode | undefined,
  ) {
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
