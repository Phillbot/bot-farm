import { injectable } from 'inversify';
import { CommandContext, Context, NextFunction } from 'grammy';
import { ParseMode } from 'grammy/types';
import i18next from 'i18next';

@injectable()
export class TelegramUtils {
  public sendReply<T extends Context>(
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

  public changeLangMiddleware = async function (
    ctx: Context,
    next: NextFunction,
  ) {
    if (ctx.from?.language_code) {
      if (i18next.language !== ctx.from.language_code) {
        await i18next.changeLanguage(ctx.from.language_code);
      }
    }

    await next();
  };
}
