import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { Logger } from '@helpers/logger';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { BaseController } from '../base-controller';
import { mapReferralUser } from '../mappers/referrals.mapper';

@injectable()
export class ReferralRewardController extends BaseController {
  constructor(
    @inject(ReactClickerBotPlayerService) _playerService: ReactClickerBotPlayerService,
    @inject(Logger) _logger: Logger,
  ) {
    super(_playerService, _logger);
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response): Promise<void> {
    const { userId, referredUserId } = req.body;

    if (!userId || !referredUserId) {
      this.respondWithError(res, 400, 'Invalid userId or referredUserId');
      return;
    }

    try {
      const result = await this._playerService.claimReferralReward(Number(userId), Number(referredUserId));

      this.respondWithSuccess(res, {
        message: 'Reward claimed successfully',
        balance: result.balance,
        referrals: mapReferralUser(result.referrals),
      });
    } catch (error) {
      if (error instanceof Error) {
        this._logger.error(`Error in ReferralRewardController.handle: ${error.message}`, error);
      } else {
        this._logger.error('Unknown error in ReferralRewardController.handle', error);
      }
      this.respondWithError(res, 500, 'Internal Server Error');
    }
  }
}
