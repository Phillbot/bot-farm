import { injectable } from 'inversify';
import { CommandContext, Context, InlineKeyboard } from 'grammy';
import {
  ForceReply,
  InlineKeyboardMarkup,
  ParseMode,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'grammy/types';

type ReplyType<T extends Context> = Readonly<{
  ctx: CommandContext<T>;
  text: string;
  parse_mode?: ParseMode;
  reply_markup?:
    | InlineKeyboard
    | InlineKeyboardMarkup
    | ReplyKeyboardMarkup
    | ReplyKeyboardRemove
    | ForceReply;
}>;

type TextButton = Readonly<{
  type: 'text';
  callbackData: string;
}>;

type UrlButton = Readonly<{
  type: 'url';
  url: string;
}>;

type ButtonType = Readonly<{
  type: 'text' | 'url';
  makeRow: boolean;
  text: string;
}> &
  (TextButton | UrlButton);

@injectable()
export class TelegramUtils {
  /**
   * motivation keep sendReply
   * as separately method over grammy reply
   * is error handling in one place
   */
  public sendReply<T extends Context>({
    ctx,
    text,
    parse_mode,
    reply_markup,
  }: ReplyType<T>) {
    ctx
      .reply(text, {
        parse_mode,
        reply_markup,
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(ctx.me, error);
      })
      //TODO: collect logs?
      // eslint-disable-next-line
      .finally(() => console.log(ctx.me, ctx.message));
  }

  public codeMessageCreator(message: string, prefix: string = ''): string {
    return `${prefix}\`\`\`${message}\`\`\``;
  }

  // TODO: make more common method, make button collection
  public inlineKeyboardBuilder(buttons: ButtonType[]): InlineKeyboardMarkup {
    const keyboard = new InlineKeyboard();

    buttons.forEach((button: ButtonType) => {
      if (!button.makeRow) {
        button.type === 'text'
          ? keyboard.text(button.text, button.callbackData)
          : keyboard.url(button.text, button.url);
        return;
      }

      keyboard.row();
    });

    return keyboard;
  }
}
