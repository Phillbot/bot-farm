import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { AbilityType } from '@database/react-clicker-bot/types';

import { BaseController } from '../base-controller';
import { mapAbilities } from '../mappers/abilities.mapper';

@injectable()
export class UpdateAbilityController extends BaseController {
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
      const { abilityType } = req.body;
      const telegramUser = this.getTelegramUser(req);

      if (!telegramUser) {
        this.respondWithError(res, 404, 'Telegram user not found');
        return;
      }

      if (!this.isValidAbilityType(abilityType)) {
        this.respondWithError(res, 400, 'Invalid abilityType value');
        return;
      }

      const userData = await this.getUserData(Number(telegramUser.id));

      if (!userData) {
        this.respondWithError(res, 404, 'Player data not found');
        return;
      }

      const updatedData = await this.updateUserAbility(userData.user_id, abilityType);

      this.respondWithSuccess(res, {
        balance: updatedData.balance,
        abilities: mapAbilities(updatedData.abilities),
        activeEnergy: updatedData.active_energy,
      });
    } catch (error) {
      if (error instanceof Error) {
        this._logger.error(`Error in UpdateAbilityController.handle: ${error.message}`, error);
      } else {
        this._logger.error('Unknown error in UpdateAbilityController.handle', error);
      }
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }

  private isValidAbilityType(abilityType: unknown): abilityType is AbilityType {
    return typeof abilityType === 'number' && Object.values(AbilityType).includes(abilityType);
  }

  private async updateUserAbility(userId: number, abilityType: AbilityType) {
    try {
      return await this._playerService.updateAbility(userId, abilityType);
    } catch (error) {
      if (error instanceof Error) {
        this._logger.error(`Error updating ability for userId ${userId}: ${error.message}`, error);
      } else {
        this._logger.error(`Unknown error updating ability for userId ${userId}`, error);
      }
      throw error;
    }
  }
}
