import { inject, injectable } from 'inversify';
import { DataTypes, Sequelize } from 'sequelize';

import { ENV } from '@config/symbols';
import { Logger } from '@helpers/logger';
import { ENV_TYPE } from '@helpers/types/env';
import { ReactClickerPostgresConnectUrl } from '@database/symbols';

import { Ability, REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA, User, UserAbility, UserStatus } from './types';

@injectable()
export class ReactClickerBotSequelize {
  private readonly _connect = new Sequelize(this._reactClickerPostgresConnectUrl, {
    logging: this._env === ENV_TYPE.DEV,
    define: {
      hooks: {},
    },
  });

  private readonly _userStatus = UserStatus.init(
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

  private readonly _ability = Ability.init(
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

  private readonly _user = User.init(
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
          model: this._userStatus,
          key: 'status_id',
        },
      },
    },
    {
      schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
      tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_USERS,
      timestamps: false,
      sequelize: this._connect,
    },
  );

  private readonly _userAbility = UserAbility.init(
    {
      user_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        references: {
          model: this._user,
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

  constructor(
    @inject(ENV.$) private readonly _env: string,
    @inject(ReactClickerPostgresConnectUrl.$) private readonly _reactClickerPostgresConnectUrl: string,
    @inject(Logger) private readonly _logger: Logger,
  ) {
    // test connection
    this._connect
      .authenticate()
      .then(() =>
        this._logger.info({
          database: ReactClickerBotSequelize.name,
          ok: true,
        }),
      )
      .catch((error) => this._logger.error(error));
  }

  get userStatus(): typeof UserStatus {
    return this._userStatus;
  }

  get ability(): typeof Ability {
    return this._ability;
  }

  get user(): typeof User {
    return this._user;
  }

  get userAbility(): typeof UserAbility {
    return this._userAbility;
  }
}
