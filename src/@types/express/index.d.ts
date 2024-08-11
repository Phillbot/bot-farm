import { User } from 'grammy/types';

declare global {
  namespace Express {
    interface Request {
      telegramReactClickerUser?: User;
    }
  }
}
