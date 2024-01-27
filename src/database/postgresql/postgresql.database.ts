import { Sequelize } from 'sequelize';

export const postgresqlSequelize = new Sequelize(
  String(process.env.POSTGRESQL_DATABASE_CONNECT_URL),
  {
    logging: process.env.ENV === 'development',
  },
);
