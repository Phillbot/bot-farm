import { injectable } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from '@helpers/logger';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { BaseController } from '../base-controller';

@injectable()
export class LogoutController extends BaseController {
  constructor(
    protected readonly _playerService: ReactClickerBotPlayerService,
    protected readonly _logger: Logger,
  ) {
    super(_playerService, _logger);
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response): Promise<void> {
    try {
      const { balance, lastLogoutTimestamp, lastLoginTimestamp, activeEnergy } = req.body;
      const telegramUser = this.getTelegramUser(req);

      if (!telegramUser) {
        this.respondWithError(res, 404, 'Telegram user not found');
        return;
      }

      await this.updateUserBalanceAndLogout(
        Number(telegramUser.id),
        balance,
        lastLogoutTimestamp,
        lastLoginTimestamp,
        activeEnergy,
      );

      this.respondWithSuccess(res, { message: 'Logout successful' });
    } catch (error) {
      // Приведение типа ошибки к Error или обработка как unknown
      if (error instanceof Error) {
        this._logger.error(`Error in LogoutController.handle: ${error.message}`, error);
      } else {
        this._logger.error('Unknown error occurred in LogoutController.handle', error);
      }
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }

  private async updateUserBalanceAndLogout(
    userId: number,
    balance: number,
    lastLogoutTimestamp: number,
    lastLoginTimestamp: number,
    activeEnergy: number,
  ): Promise<void> {
    try {
      await this._playerService.updateBalanceAndLogout(
        userId,
        balance,
        lastLogoutTimestamp,
        lastLoginTimestamp,
        activeEnergy,
      );
    } catch (error) {
      if (error instanceof Error) {
        this._logger.error(`Error updating balance and logout for user ${userId}: ${error.message}`, error);
      } else {
        this._logger.error(`Unknown error occurred while updating balance and logout for user ${userId}`, error);
      }
      throw error;
    }
  }
}
