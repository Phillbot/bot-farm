import { NBURateBotPostgresqlSequelize } from '@database/nbu-rate-bot.db';
import { inject, injectable } from 'inversify';

@injectable()
export class NBUCurrencyBotUser {
  constructor(
    @inject(NBURateBotPostgresqlSequelize)
    private readonly _nbuRateBotPostgresqlSequelize: NBURateBotPostgresqlSequelize,
  ) {}
  public async getUserById(userId?: number) {
    return (
      this._nbuRateBotPostgresqlSequelize.nbuRateBotUsersModel
        .findOne({
          where: { user_id: userId },
        })
        // eslint-disable-next-line
        .catch((e) => console.log(e))
    );
  }

  public async getSubscribersChatIds() {
    return (
      this._nbuRateBotPostgresqlSequelize.nbuRateBotUsersModel
        .findAll({
          raw: true,
          attributes: ['user_id'],
          where: {
            is_subscribe_active: true,
          },
        })
        // eslint-disable-next-line
        .catch((e) => console.log(e))
    );
  }

  public async createUser(
    userId: number,
    isSubscribeActive: boolean,
    username?: string,
  ) {
    this._nbuRateBotPostgresqlSequelize.nbuRateBotUsersModel
      .create({
        user_id: userId,
        user_name: username,
        is_subscribe_active: isSubscribeActive,
      })
      // eslint-disable-next-line
      .catch((e) => console.log(e));
  }

  public async updateUser(userId: number, isSubscribeActive: boolean) {
    this._nbuRateBotPostgresqlSequelize.nbuRateBotUsersModel
      .update(
        { is_subscribe_active: isSubscribeActive },
        { where: { user_id: userId } },
      )
      // eslint-disable-next-line
      .catch((e) => console.log(e));
  }
}
