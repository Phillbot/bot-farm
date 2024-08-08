import { inject, injectable } from 'inversify';
import { DataTypes, Sequelize } from 'sequelize';

import { ENV } from '@config/symbols';
import { Logger } from '@helpers/logger';
import { ENV_TYPE } from '@helpers/types/env';
import { ReactClickerPostgresConnectUrl } from '@database/symbols';

import {
  Ability,
  ActiveEnergyByUser,
  LastSession,
  REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA,
  Referral,
  User,
  UserAbility,
  UserStatus,
} from './types';

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
    this.initializeModels();

    // Тестовое подключение
    this._connect
      .authenticate()
      .then(() => this._logger.info({ database: ReactClickerBotSequelize.name, ok: true }))
      .catch((error) => this._logger.error(error));
  }

  private initializeModels() {
    UserStatus.init(
      {
        status_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        status_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
        tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_USER_STATUSES,
        timestamps: false,
        sequelize: this._connect,
      },
    );

    Ability.init(
      {
        ability_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        ability_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
        tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_ABILITIES,
        timestamps: false,
        sequelize: this._connect,
      },
    );

    User.init(
      {
        user_id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: false,
          allowNull: false,
        },
        reg_data: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        referral_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        user_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        user_status: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: UserStatus,
            key: 'status_id',
          },
        },
        balance: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
        tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_USERS,
        timestamps: false,
        sequelize: this._connect,
      },
    );

    Referral.init(
      {
        user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: User,
            key: 'user_id',
          },
          primaryKey: true,
        },
        referred_user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: User,
            key: 'user_id',
          },
          primaryKey: true,
        },
      },
      {
        schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
        tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_USER_REFERRALS,
        timestamps: false,
        sequelize: this._connect,
      },
    );

    UserAbility.init(
      {
        user_id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          references: {
            model: User,
            key: 'user_id',
          },
        },
        click_coast_level: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        energy_level: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        energy_regeniration_level: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
        tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_USER_ABILITIES,
        timestamps: false,
        sequelize: this._connect,
      },
    );

    ActiveEnergyByUser.init(
      {
        user_id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          references: {
            model: User,
            key: 'user_id',
          },
        },
        active_energy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1000,
        },
      },
      {
        schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
        tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_ACTIVE_ENERGY,
        timestamps: false,
        sequelize: this._connect,
      },
    );

    LastSession.init(
      {
        user_id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          references: {
            model: User,
            key: 'user_id',
          },
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        last_logout: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
        tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_LAST_SESSIONS,
        timestamps: false,
        sequelize: this._connect,
      },
    );
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
}
