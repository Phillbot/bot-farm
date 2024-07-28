import { EmojiFlavor } from '@grammyjs/emoji';
import { I18nFlavor } from '@grammyjs/i18n';
import { Context, SessionFlavor } from 'grammy';

export interface SessionData {
  __language_code?: string;
}

export interface ICommand {
  withCtx(ctx: BotContext): void;
}

export type BotContext = EmojiFlavor<Context & SessionFlavor<SessionData> & I18nFlavor>;
