import { injectable } from 'inversify';
import { DataTypes, Sequelize } from 'sequelize';

enum NBU_RATE_BOT_CONNECTION_DATA {
  TABLE_SUBSCRIBERS = 'bot_subscribers',
  SCHEMA_SUBSCRIBERS = 'nbu_exchange',
}

@injectable()
export class NBURateBotPostgresqlSequelize {
  private readonly _connect = new Sequelize(
    process.env.POSTGRESQL_DATABASE_CONNECT_URL as string,
    {
      logging: process.env.ENV === 'development',
    },
  );

  constructor() {
    this._connect
      .authenticate()
      .then(() =>
        // eslint-disable-next-line
        console.table({ database: 'postgresqlSequelize', status: 'ok' }),
      )
      // eslint-disable-next-line
      .catch((error) => console.error(error));
  }

  // models, can be separate

  public nbuRateBotUsersModel = this._connect.define(
    NBU_RATE_BOT_CONNECTION_DATA.TABLE_SUBSCRIBERS,
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
    },
    {
      schema: NBU_RATE_BOT_CONNECTION_DATA.SCHEMA_SUBSCRIBERS,
      timestamps: false,
    },
  );
}
