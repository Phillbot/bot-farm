import { DataTypes } from 'sequelize';
import { postgresqlSequelize } from '../postgresql.database';

// TODO: make types for schema and tables
export const botSubscribers = postgresqlSequelize.define(
  'bot_subscribers',
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
  { schema: 'nbu_exchange', timestamps: false },
);
