import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import { User } from 'grammy/types';

import { ReactClickerBot } from '@telegram/index';
import { ReactClickerSessionDuration } from '@telegram/react-clicker-bot/symbols';
import { Logger } from '@helpers/logger';

@injectable()
export class AuthMiddleware {
  constructor(
    @inject(ReactClickerBot) private readonly _bot: ReactClickerBot,
    @inject(Logger) private readonly _logger: Logger,
    @inject(ReactClickerSessionDuration.$) private readonly _sessionDuration: string,
  ) {
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const initData = this.getInitData(req);
      const authData = new URLSearchParams(initData);

      if (this.isSessionExpired(authData)) {
        this.respondWithUnauthorized(res, 'Unauthorized: auth_date is expired');
        return;
      }

      const isAuthValid = await this.isAuthValid(initData);
      if (!isAuthValid) {
        this.respondWithUnauthorized(res, 'Unauthorized');
        return;
      }

      req.telegramReactClickerUser = this.getUserFromAuthData(authData);
      next();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private getInitData(req: Request): string {
    return req.body.initData || '';
  }

  private isSessionExpired(authData: URLSearchParams): boolean {
    const authDate = parseInt(authData.get('auth_date') ?? '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime - authDate > Number(this._sessionDuration);
  }

  private async isAuthValid(initData: string): Promise<boolean> {
    return this._bot.verifyAuth({ initData });
  }

  private getUserFromAuthData(authData: URLSearchParams): User {
    try {
      return JSON.parse(authData.get('user') ?? '{}');
    } catch (error) {
      this._logger.error('Error parsing user data from authData:', error);
      throw new Error('Invalid user data format');
    }
  }

  private respondWithUnauthorized(res: Response, message: string): void {
    res.status(401).json({ success: false, message });
  }

  private handleError(res: Response, error: unknown): void {
    if (error instanceof Error) {
      this._logger.error('Auth middleware error:', error);
    } else {
      this._logger.error('Unknown error in Auth middleware:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
