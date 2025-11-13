import { DataTypes, Sequelize } from 'sequelize';

import {
  Ability,
  ActiveEnergyByUser,
  Boost,
  LastSession,
  REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA,
  Referral,
  User,
  UserAbility,
  UserStatus,
} from './react-clicker-bot.models';

export function initializeModels(sequelize: Sequelize): void {
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
      sequelize,
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
      sequelize,
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
        type: DataTypes.BIGINT,
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
      sequelize,
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
      reward_claim: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
      tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_USER_REFERRALS,
      timestamps: false,
      sequelize,
    },
  );

  Boost.init(
    {
      user_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      last_boost_run: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
      tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_BOOSTS,
      timestamps: false,
      sequelize,
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
      sequelize,
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
      sequelize,
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
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      last_logout: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      schema: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.SCHEMA,
      tableName: REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA.TABLE_LAST_SESSIONS,
      timestamps: false,
      sequelize,
    },
  );
}
