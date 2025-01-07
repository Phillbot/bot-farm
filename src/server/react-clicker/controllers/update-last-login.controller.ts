import { injectable } from 'inversify';
import { Request, Response } from 'express';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { Logger } from '@helpers/logger';

import { BaseController } from '../base-controller';

@injectable()
export class UpdateLastLoginController extends BaseController {
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
      const lastLogin = this.getLastLogin(req);

      if (!telegramUser) {
        this.respondWithError(res, 404, 'Telegram user not found');
        return;
      }

      if (!this.isLasLoginValid(lastLogin)) {
        this.respondWithError(res, 400, 'Invalid lastLogin value');
        return;
      }

      await this._playerService.updateLastLogin(Number(telegramUser.id), lastLogin);

      this.respondWithSuccess(res, { message: 'Last login updated successfully' });
    } catch (error) {
      if (error instanceof Error) {
        this._logger.error(`Error in UpdateLastLoginController.handle: ${error.message}`, error);
      } else {
        this._logger.error('Unknown error in UpdateLastLoginController.handle', error);
      }
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }

  private getLastLogin(req: Request): number {
    return req.body.lastLogin;
  }

  private isLasLoginValid(lastBoostRun: unknown): lastBoostRun is number {
    return typeof lastBoostRun === 'number';
  }
}
