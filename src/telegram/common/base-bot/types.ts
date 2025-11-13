import { Context, SessionFlavor } from 'grammy';

import { EmojiFlavor } from '@grammyjs/emoji';
import { I18nFlavor } from '@grammyjs/i18n';

export interface SessionData {
  __language_code?: string;
}

export interface ICommand {
  withCtx(ctx: BotContext): void | Promise<void>;
}

export type BotContext = EmojiFlavor<Context & SessionFlavor<SessionData> & I18nFlavor>;

export interface CommandDefinition {
  command: string;
  descriptionKey: string;
  handler: ICommand;
}
