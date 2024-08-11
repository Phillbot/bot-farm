import { User } from 'grammy/types';

export function mapTelegramUser(telegramUser: User) {
  return {
    id: telegramUser.id,
    userName: telegramUser.username,
    isBot: telegramUser.is_bot,
    isPremium: telegramUser.is_premium,
    languageCode: telegramUser.language_code,
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name,
  };
}
