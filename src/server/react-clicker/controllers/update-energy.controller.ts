import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';

import { BaseController } from '../base-controller';

@injectable()
export class UpdateEnergyController extends BaseController {
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
      const activeEnergy = this.getActiveEnergyFromRequest(req);

      if (!telegramUser) {
        this.respondWithError(res, 404, 'Telegram user not found');
        return;
      }

      if (!this.isActiveEnergyValid(activeEnergy)) {
        this.respondWithError(res, 400, 'Invalid activeEnergy value');
        return;
      }

      const userData = await this.getUserData(Number(telegramUser.id));

      if (!userData) {
        this.respondWithError(res, 404, 'Player data not found');
        return;
      }

      await this._playerService.updateUserActiveEnergy(Number(telegramUser.id), { active_energy: activeEnergy });

      this.respondWithSuccess(res, { activeEnergy });
    } catch (error) {
      if (error instanceof Error) {
        this._logger.error(`Error in UpdateEnergyController.handle: ${error.message}`, error);
      } else {
        this._logger.error('Unknown error in UpdateEnergyController.handle', error);
      }
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }

  private getActiveEnergyFromRequest(req: Request): number {
    return req.body.activeEnergy;
  }

  private isActiveEnergyValid(activeEnergy: unknown): activeEnergy is number {
    return typeof activeEnergy === 'number';
  }
}
