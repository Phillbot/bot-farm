import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';

import { BaseController } from '../base-controller';

@injectable()
export class UpdateBoostController extends BaseController {
  constructor(
    protected readonly _playerService: ReactClickerBotPlayerService,
    @inject(LoggerToken.$)
    protected readonly _logger: Logger,
  ) {
    super(_playerService, _logger);
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response): Promise<void> {
    try {
      const telegramUser = this.getTelegramUser(req);
      const lastBoostRun = this.getLastBoostRunFromRequest(req);

      if (!telegramUser) {
        this.respondWithError(res, 404, 'Telegram user not found');
        return;
      }

      if (!this.isLastBoostRunValid(lastBoostRun)) {
        this.respondWithError(res, 400, 'Invalid lastBoostRun value');
        return;
      }

      await this._playerService.updateUserBoost(Number(telegramUser.id), lastBoostRun);

      this.respondWithSuccess(res, { message: 'Boost updated successfully' });
    } catch (error) {
      if (error instanceof Error) {
        this._logger.error(`Error in UpdateBoostController.handle: ${error.message}`, error);
      } else {
        this._logger.error('Unknown error in UpdateBoostController.handle', error);
      }
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }

  private getLastBoostRunFromRequest(req: Request): number {
    return req.body.lastBoostRun;
  }

  private isLastBoostRunValid(lastBoostRun: unknown): lastBoostRun is number {
    return typeof lastBoostRun === 'number';
  }
}
