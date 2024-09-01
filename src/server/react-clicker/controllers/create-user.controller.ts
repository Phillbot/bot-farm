import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { User } from 'grammy/types';

import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { Logger } from '@helpers/logger';
import { ExtendedUser, UserResponseData, UserStatus } from '@database/react-clicker-bot/types';

import { BaseController } from '../base-controller';
import { createUserResponseDataMapper } from '../mappers/create-user.mapper';

@injectable()
export class CreateUserController extends BaseController {
  constructor(
    @inject(ReactClickerBotPlayerService) _playerService: ReactClickerBotPlayerService,
    @inject(Logger) _logger: Logger,
  ) {
    super(_playerService, _logger);
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response): Promise<void> {
    try {
      const telegramUser = this.getTelegramUser(req);

      if (!telegramUser) {
        this.respondWithError(res, 404, 'Telegram user not found');
        return;
      }

      const validReferralId = await this.validateReferralId(telegramUser.id, req.body.referralId);
      const newUser = this.createNewUserObject(telegramUser, validReferralId);

      const createdUser = await this._playerService.createUser(newUser);

      if (!createdUser) {
        this.respondWithError(res, 500, 'Failed to create user');
        return;
      }

      if (validReferralId) {
        await this._playerService.updateReferrals(validReferralId, Number(telegramUser.id));
      }

      const userData = await this._playerService.getUserData(Number(telegramUser.id));

      if (!userData) {
        this.respondWithError(res, 500, 'Failed to retrieve user data after creation');
        return;
      }

      const data = await this.createResponseData(telegramUser, userData);
      this.respondWithSuccess(res, data);
    } catch (error) {
      this._logger.error('Error in createUser:', error);
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }

  private async validateReferralId(userId: number, referralId?: string): Promise<number | undefined> {
    if (!referralId) return undefined;

    const referralUser = await this._playerService.getUserById(Number(referralId));
    if (referralUser && Number(referralId) !== userId) {
      return Number(referralId);
    }

    this._logger.warn(`Referral ID ${referralId} not found in the database.`);
    return undefined;
  }

  private createNewUserObject(telegramUser: User, validReferralId?: number) {
    return {
      user_id: Number(telegramUser.id),
      reg_data: Date.now(),
      user_name: telegramUser.username || '',
      first_name: telegramUser.first_name || '',
      user_status: UserStatus.ACTIVE,
      referral_id: validReferralId,
      balance: 0,
    };
  }

  private createResponseData(telegramUser: User, userData: ExtendedUser): Promise<UserResponseData> {
    return createUserResponseDataMapper(telegramUser, userData);
  }
}
