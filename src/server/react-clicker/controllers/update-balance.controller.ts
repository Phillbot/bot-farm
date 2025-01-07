import { injectable } from 'inversify';
import { Request, Response } from 'express';

import { Logger } from '@helpers/logger';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { BaseController } from '../base-controller';

@injectable()
export class UpdateBalanceController extends BaseController {
  constructor(
    protected readonly _playerService: ReactClickerBotPlayerService,
    protected readonly _logger: Logger,
  ) {
    super(_playerService, _logger);
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response): Promise<void> {
    try {
      const telegramUser = this.getTelegramUser(req);
      const balance = this.getBalanceFromRequest(req);

      if (!telegramUser) {
        this.respondWithError(res, 404, 'Telegram user not found');
        return;
      }

      if (!this.isBalanceValid(balance)) {
        this.respondWithError(res, 400, 'Invalid balance value');
        return;
      }

      const userData = await this.getUserData(Number(telegramUser.id));

      if (!userData) {
        this.respondWithError(res, 404, 'Player data not found');
        return;
      }

      const newBalance = userData.balance + balance;
      await this._playerService.updateUser(Number(telegramUser.id), { balance: newBalance });

      this.respondWithSuccess(res, { newBalance });
    } catch (error) {
      if (error instanceof Error) {
        this._logger.error(`Error in UpdateBalanceController.handle: ${error.message}`, error);
      } else {
        this._logger.error('Unknown error in UpdateBalanceController.handle', error);
      }
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }

  private getBalanceFromRequest(req: Request): number {
    return req.body.balance;
  }

  private isBalanceValid(balance: unknown): balance is number {
    return typeof balance === 'number';
  }
}
