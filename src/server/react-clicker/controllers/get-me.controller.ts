import { Request, Response } from 'express';
import { User } from 'grammy/types';
import { inject, injectable } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { ExtendedUser, UserResponseData } from '@database/react-clicker-bot/types';
import { ReactClickerBot } from '@telegram';

import { BaseController } from '../base-controller';
import { createUserResponseDataMapper } from '../mappers/create-user.mapper';

@injectable()
export class GetMeController extends BaseController {
  constructor(
    protected readonly _playerService: ReactClickerBotPlayerService,
    @inject(LoggerToken.$)
    protected readonly _logger: Logger,
    @inject(ReactClickerBot)
    private readonly _reactClickerBot: ReactClickerBot,
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

      const userData = await this.getUserData(telegramUser.id);

      if (!userData) {
        this.respondWithError(res, 404, 'Player data not found');
        return;
      }

      const data = this.createResponseData(telegramUser, userData);
      this.respondWithSuccess(res, data);
    } catch (error) {
      this._logger.error('Error in getMe:', error);
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }

  private createResponseData(telegramUser: User, userData: ExtendedUser): UserResponseData {
    return createUserResponseDataMapper(telegramUser, userData, this._reactClickerBot.bot.botInfo);
  }
}
