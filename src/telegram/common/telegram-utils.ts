import crypto from 'crypto';

import { CommandContext, Context, InlineKeyboard } from 'grammy';
import {
  ForceReply,
  InlineKeyboardMarkup,
  ParseMode,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'grammy/types';
import { assertNever } from 'handy-ts-tools/asserts';
import { inject, injectable } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

export type AuthData = {
  initData: string;
};

type ReplyType<T extends Context> = Readonly<{
  ctx: CommandContext<T>;
  text: string;
  parse_mode?: ParseMode;
  reply_markup?: InlineKeyboard | InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}>;

type TextButton = Readonly<{
  type: 'text';
  text: string;
  callbackData: string;
}>;

type UrlButton = Readonly<{
  type: 'url';
  text: string;
  url: string;
}>;

type RowButton = Readonly<{
  type: 'row';
}>;

type WebAppButton = Readonly<{
  type: 'web_app';
  text: string;
  url: string;
}>;

type ButtonType = Readonly<{
  type: 'text' | 'url' | 'row' | 'web_app';
}> &
  (TextButton | UrlButton | RowButton | WebAppButton);

@injectable()
export class TelegramUtils {
  /**
   * motivation keep sendReply
   * as separately method over grammy reply
   * is error handling in one place
   */

  constructor(
    @inject(LoggerToken.$)
    private readonly _logger: Logger,
  ) { }

  public async sendReply<T extends Context>({ ctx, text, parse_mode, reply_markup }: ReplyType<T>): Promise<void> {
    try {
      await ctx.reply(text, {
        parse_mode,
        reply_markup,
      });
      this._logger.info(`Message sent: ${ctx.message?.message_id}`);
      this._logger.info(ctx.me);
      this._logger.debug(ctx.message ?? {});
    } catch (error) {
      this._logger.error(`Failed to send message to ${ctx.from?.id}`, error);
    } finally {
      this._logger.debug('sendReply finished');
    }
  }

  public codeMessageCreator(message: string, prefix: string = ''): string {
    return `${prefix}\`\`\`${message}\`\`\``;
  }

  public simpleCodeMessageCreator(message: string, prefix: string = ''): string {
    return `${prefix}\`${message}\``;
  }

  // TODO: make more common method, make button collection
  public inlineKeyboardBuilder(buttons: ButtonType[]): InlineKeyboardMarkup {
    const keyboard = new InlineKeyboard();

    buttons.forEach((button: ButtonType) => {
      const { type } = button;

      switch (type) {
        case 'row':
          keyboard.row();
          break;
        case 'text':
          keyboard.text(button.text, button.callbackData);
          break;
        case 'url':
          keyboard.url(button.text, button.url);
          break;
        case 'web_app':
          keyboard.webApp(button.text, button.url);
          break;
        default:
          assertNever(type);
      }
    });

    return keyboard;
  }

  public async verifyAuth(initData: string, token: string): Promise<boolean> {
    try {
      const clientDataKeys = new URLSearchParams(initData);
      const hashFromClient = clientDataKeys.get('hash');
      const dataToCheck: string[] = [];

      clientDataKeys.sort();
      clientDataKeys.forEach((v, k) => k !== 'hash' && dataToCheck.push(`${k}=${v}`));

      const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest('hex');
      const signature = crypto.createHmac('sha256', secret).update(dataToCheck.join('\n'));
      const referenceHash = signature.digest('hex');

      return referenceHash === hashFromClient;
    } catch (error) {
      this._logger.error('Verification error:', error);
      return false;
    }
  }
}
