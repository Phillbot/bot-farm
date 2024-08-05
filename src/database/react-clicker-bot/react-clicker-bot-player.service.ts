import { inject, injectable } from 'inversify';
import { Logger } from '@helpers/logger';

import { User, UserAbility } from './types';
import { ReactClickerBotSequelize } from './react-clicker-bot.db';

@injectable()
export class ReactClickerBotPlayerService {
  constructor(
    @inject(ReactClickerBotSequelize)
    private readonly _reactClickerBotSequelize: ReactClickerBotSequelize,
    @inject(Logger) private readonly _logger: Logger,
  ) {}

  public async getUserById(user_id: number) {
    return this._reactClickerBotSequelize.user.findOne({ where: { user_id } }).catch((e) => this._logger.error(e));
  }

  public async getAllUsers() {
    return this._reactClickerBotSequelize.user.findAll().catch((e) => this._logger.error(e));
  }

  public async createUser(userData: Omit<User, 'user_id'> & { user_id: number }) {
    return this._reactClickerBotSequelize.user.create(userData).catch((e) => this._logger.error(e));
  }

  public async updateUser(user_id: number, userData: Partial<User>) {
    return this._reactClickerBotSequelize.user
      .update(userData, { where: { user_id } })
      .catch((e) => this._logger.error(e));
  }

  public async deleteUser(user_id: number) {
    return this._reactClickerBotSequelize.user.destroy({ where: { user_id } }).catch((e) => this._logger.error(e));
  }

  public async getUserAbilities(user_id: number) {
    return this._reactClickerBotSequelize.userAbility
      .findOne({ where: { user_id } })
      .catch((e) => this._logger.error(e));
  }

  public async setUserAbilities(user_id: number, abilities: Partial<UserAbility>) {
    return this._reactClickerBotSequelize.userAbility
      .update(abilities, { where: { user_id } })
      .catch((e) => this._logger.error(e));
  }
}
