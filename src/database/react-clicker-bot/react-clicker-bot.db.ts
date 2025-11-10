import { inject, injectable } from 'inversify';
import { Sequelize } from 'sequelize';

import { LogLevel } from '@config/symbols';
import { LOG_LEVEL, Logger } from '@helpers/logger';

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
    @inject(LogLevel.$)
    private readonly _logLevel: string,
    @inject(ReactClickerPostgresConnectUrl.$)
    private readonly _reactClickerPostgresConnectUrl: string,
    private readonly _logger: Logger,
  ) {
    this._connect = new Sequelize(this._reactClickerPostgresConnectUrl, {
      dialect: 'postgres',
      logging: (msg) => this._logLevel !== LOG_LEVEL.NONE && this._logger.info(`[ReactClickerBotSequelize]: ${msg}`),
      define: {
        hooks: {},
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });

    initializeModels(this._connect);

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
