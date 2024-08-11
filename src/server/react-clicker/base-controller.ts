import { injectable } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from '@helpers/logger';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { User } from 'grammy/types';

@injectable()
export abstract class BaseController {
  constructor(
    protected readonly _playerService: ReactClickerBotPlayerService,
    protected readonly _logger: Logger,
  ) {}

  public abstract handle(req: Request, res: Response): Promise<void>;

  protected getTelegramUser(req: Request): User | undefined {
    return req.telegramReactClickerUser;
  }

  protected async getUserData(userId: number) {
    try {
      return await this._playerService.getUserData(userId);
    } catch (error) {
      this._logger.error(`Error fetching user data for userId ${userId}:`, error);
      throw error;
    }
  }

  protected respondWithError(res: Response, statusCode: number, message: string): void {
    res.status(statusCode).json({ ok: false, error: message });
  }

  protected respondWithSuccess<T>(res: Response, data: T): void {
    res.status(200).json({ ok: true, ...data });
  }

  protected isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }
}
