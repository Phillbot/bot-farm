import { inject, injectable } from 'inversify';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

import { LOG_LEVEL, Logger } from '@helpers/logger';
import { LogLevel } from '@config/symbols';
import { NbuBotPostgresConnectUrl } from '@database/symbols';

enum NBU_RATE_BOT_CONNECTION_DATA {
  TABLE_SUBSCRIBERS = 'bot_subscribers',
  SCHEMA_SUBSCRIBERS = 'nbu_exchange',
}

export type NBURateBotUserType = Readonly<
  Pick<NBURateBotUser, 'user_id' | 'user_name' | 'is_subscribe_active' | 'lang'>
>;

export class NBURateBotUser extends Model<InferAttributes<NBURateBotUser>, InferCreationAttributes<NBURateBotUser>> {
  declare user_id: number;
  declare user_name?: CreationOptional<string>;
  declare is_subscribe_active: boolean;
  declare lang: string;
}

@injectable()
export class NBURateBotPostgresqlSequelize {
  private readonly _connect = new Sequelize(this._nbuBotPostgresConnectUrl, {
    logging: (msg) => this._logLevel !== LOG_LEVEL.NONE && this._logger.info(`[NBURateBotPostgresqlSequelize]: ${msg}`),
    define: {
      hooks: {},
    },
  });

  private readonly _user = NBURateBotUser.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        allowNull: false,
      },
      user_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_subscribe_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      lang: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      schema: NBU_RATE_BOT_CONNECTION_DATA.SCHEMA_SUBSCRIBERS,
      tableName: NBU_RATE_BOT_CONNECTION_DATA.TABLE_SUBSCRIBERS,
      timestamps: false,
      sequelize: this._connect,
    },
  );

  constructor(
    @inject(NbuBotPostgresConnectUrl.$)
    private readonly _nbuBotPostgresConnectUrl: string,
    @inject(LogLevel.$)
    private readonly _logLevel: string,
    private readonly _logger: Logger,
  ) {
    // test connection
    this._connect
      .authenticate()
      .then(() =>
        this._logger.info({
          database: NBURateBotPostgresqlSequelize.name,
          ok: true,
        }),
      )
      .catch((error) => this._logger.error(error));
  }

  get user(): typeof NBURateBotUser {
    return this._user;
  }
}
