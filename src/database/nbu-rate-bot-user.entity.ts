import { inject, injectable } from 'inversify';

import { NBURateBotPostgresqlSequelize } from '@database/nbu-rate-bot.db';

@injectable()
export class NBUCurrencyBotUser {
  constructor(
    @inject(NBURateBotPostgresqlSequelize)
    private readonly _nbuRateBotPostgresqlSequelize: NBURateBotPostgresqlSequelize,
  ) {}
  public async getUserById(userId?: number) {
    return (
      this._nbuRateBotPostgresqlSequelize.user
        .findOne({
          where: { user_id: userId },
        })
        // eslint-disable-next-line
        .catch((e) => console.log(e))
    );
  }

  // TODO: type for part , add attributes
  public async getSubscribers() {
    return (
      this._nbuRateBotPostgresqlSequelize.user
        .findAll({
          raw: true,
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
    lang: string,
    username?: string,
  ) {
    this._nbuRateBotPostgresqlSequelize.user
      .create({
        user_id: Number(userId),
        user_name: username,
        is_subscribe_active: isSubscribeActive,
        lang,
      })
      // eslint-disable-next-line
      .catch((e) => console.log(e));
  }

  public async updateUser(
    userId: number,
    isSubscribeActive: boolean,
    lang: string,
  ) {
    this._nbuRateBotPostgresqlSequelize.user
      .update(
        { is_subscribe_active: isSubscribeActive, lang },
        { where: { user_id: userId } },
      )
      // eslint-disable-next-line
      .catch((e) => console.log(e));
  }
}
