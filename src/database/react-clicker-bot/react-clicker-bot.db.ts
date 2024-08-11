import { inject, injectable } from 'inversify';
import { Sequelize } from 'sequelize';
import { ENV } from '@config/symbols';
import { Logger } from '@helpers/logger';
import { ENV_TYPE } from '@helpers/types/env';
import { ReactClickerPostgresConnectUrl } from '@database/symbols';
import {
  Ability,
  ActiveEnergyByUser,
  Boost,
  LastSession,
  Referral,
  User,
  UserAbility,
  UserStatus,
} from './react-clicker-bot.models';
import { initializeModels } from './utils';

@injectable()
export class ReactClickerBotSequelize {
  private readonly _connect: Sequelize;

  constructor(
    @inject(ENV.$) private readonly _env: string,
    @inject(ReactClickerPostgresConnectUrl.$) private readonly _reactClickerPostgresConnectUrl: string,
    @inject(Logger) private readonly _logger: Logger,
  ) {
    this._connect = new Sequelize(this._reactClickerPostgresConnectUrl, {
      logging: this._env === ENV_TYPE.DEV,
      define: {
        hooks: {},
      },
    });

    // Инициализация моделей
    initializeModels(this._connect);

    // Тестовое подключение
    this._connect
      .authenticate()
      .then(() => this._logger.info({ database: ReactClickerBotSequelize.name, ok: true }))
      .catch((error) => this._logger.error(error));
  }

  get sequelize(): Sequelize {
    return this._connect;
  }

  get userStatus(): typeof UserStatus {
    return UserStatus;
  }

  get ability(): typeof Ability {
    return Ability;
  }

  get user(): typeof User {
    return User;
  }

  get userAbility(): typeof UserAbility {
    return UserAbility;
  }

  get referrals(): typeof Referral {
    return Referral;
  }

  get activeEnergy(): typeof ActiveEnergyByUser {
    return ActiveEnergyByUser;
  }

  get lastSession(): typeof LastSession {
    return LastSession;
  }

  get boost(): typeof Boost {
    return Boost;
  }
}
