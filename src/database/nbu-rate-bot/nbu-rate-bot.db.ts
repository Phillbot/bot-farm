import { URL } from 'url';

import { inject, injectable, optional } from 'inversify';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

import { Logger } from '@helpers/logger';
import { LogLevel } from '@config/symbols';
import { NbuBotPostgresConnectUrl, NbuBotPostgresPort } from '@database/symbols';

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
  private readonly _connect: Sequelize;

  private _user!: typeof NBURateBotUser;

  constructor(
    @inject(NbuBotPostgresConnectUrl.$)
    private readonly _nbuBotPostgresConnectUrl: string,
    @inject(LogLevel.$)
    private readonly _logLevel: string,
    private readonly _logger: Logger,
    @inject(NbuBotPostgresPort.$)
    @optional()
    private readonly _nbuBotPostgresPort?: number,
  ) {
    const connectionUrl = this.normalizeConnectionUrl(this._nbuBotPostgresConnectUrl);

    this._connect = new Sequelize(connectionUrl, {
      dialect: 'postgres',
      logging: (msg) => this._logLevel !== 'none' && this._logger.info(`[NBURateBotPostgresqlSequelize]: ${msg}`),
      dialectOptions: {
        // Allow self-signed certificates in environments where the DB provides one.
        // If you'd like stricter verification, make this conditional or remove it.
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });

    this._user = NBURateBotUser.init(
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
    // test connection
    this._connect
      .authenticate()
      .then(() => {
        this._logger.info({
          database: NBURateBotPostgresqlSequelize.name,
          ok: true,
        });
      })
      .catch((error) => this._logger.error(error));
  }

  get user(): typeof NBURateBotUser {
    return this._user;
  }

  private normalizeConnectionUrl(connectionUrl: string): string {
    try {
      const parsedUrl = new URL(connectionUrl);

      const port = this._nbuBotPostgresPort?.toString();

      if (port && parsedUrl.port !== port) {
        parsedUrl.port = port;
      }

      parsedUrl.searchParams.delete('sslmode');

      return parsedUrl.toString();
    } catch (error) {
      this._logger.error('[NBURateBotPostgresqlSequelize] Invalid PostgreSQL connection URL', error);
      return connectionUrl;
    }
  }
}
