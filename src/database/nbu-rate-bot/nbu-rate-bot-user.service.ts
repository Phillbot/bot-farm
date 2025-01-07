import { injectable } from 'inversify';

import { NBURateBotPostgresqlSequelize, NBURateBotUserType } from '@database';
import { Logger } from '@helpers/logger';

@injectable()
export class NBUCurrencyBotUserService {
  constructor(
    private readonly _nbuRateBotPostgresqlSequelize: NBURateBotPostgresqlSequelize,
    private readonly _logger: Logger,
  ) {}

  public async getUserById({ user_id }: Pick<NBURateBotUserType, 'user_id'>) {
    return this._nbuRateBotPostgresqlSequelize.user.findOne({ where: { user_id } }).catch((e) => this._logger.error(e));
  }

  public async getSubscribers() {
    return this._nbuRateBotPostgresqlSequelize.user
      .findAll({
        raw: true,
        where: { is_subscribe_active: true },
      })
      .catch((e) => this._logger.error(e));
  }

  public async getSubscribersUserIds() {
    return this._nbuRateBotPostgresqlSequelize.user
      .findAll({
        raw: true,
        where: { is_subscribe_active: true },
        attributes: ['user_id', 'lang'],
      })
      .catch((e) => this._logger.error(e));
  }

  public async createUser(userData: NBURateBotUserType) {
    this._nbuRateBotPostgresqlSequelize.user.create({ ...userData }).catch((e) => this._logger.error(e));
  }

  public async updateUser({ user_id, is_subscribe_active, lang, user_name }: NBURateBotUserType) {
    this._nbuRateBotPostgresqlSequelize.user
      .update({ is_subscribe_active, lang, user_name }, { where: { user_id } })
      .catch((e) => this._logger.error(e));
  }
}
