import { EmojiFlavor } from '@grammyjs/emoji';
import { I18nFlavor } from '@grammyjs/i18n';
import { SessionData } from '@telegram/common/base-bot';
import { Context, SessionFlavor } from 'grammy';
import { LanguageCode } from 'grammy/types';

export enum COMMANDS {
  START = 'start',
  PLAY = 'play',
}

export const defaultLang: LanguageCode = 'uk';

export const supportedLangs: LanguageCode[] = [defaultLang, 'en'] as LanguageCode[];

export type ReactClickerBotContext = EmojiFlavor<Context & SessionFlavor<SessionData> & I18nFlavor>;
