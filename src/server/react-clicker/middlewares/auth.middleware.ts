import { NextFunction, Request, Response } from 'express';
import { container } from '@config/inversify.config';
import { ReactClickerBot } from '@telegram/index';
import { ReactClickerSessionDuration } from '@telegram/react-clicker-bot/symbols';
import { Logger } from '@helpers/logger';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  isPremium: boolean;
  allowsWriteToPm: boolean;
};

export function authMiddleware(bot: ReactClickerBot) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { initData } = req.body;
      const authData = new URLSearchParams(initData);
      const authDate = parseInt(authData.get('auth_date') ?? '0', 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLimit = Number(container.get<string>(ReactClickerSessionDuration.$));

      if (currentTime - authDate > timeLimit) {
        res.status(401).json({ success: false, message: 'Unauthorized: auth_date is expired' });
        return;
      }

      const isValid = await bot.verifyAuth({ initData });

      if (!isValid) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = JSON.parse(authData.get('user') ?? '{}');

      req.user = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        userName: user.username,
        isPremium: user.is_premium,
        allowsWriteToPm: user.allows_write_to_pm,
      };

      next();
    } catch (error) {
      container.get<Logger>(Logger).error('Auth middleware error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
}
