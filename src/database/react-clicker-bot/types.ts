import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export enum REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA {
  SCHEMA = 'players',
  TABLE_USERS = 'users',
  TABLE_USER_STATUSES = 'user_statuses',
  TABLE_ABILITIES = 'abilities',
  TABLE_USER_ABILITIES = 'user_abilities',
}

export class UserStatus extends Model<InferAttributes<UserStatus>, InferCreationAttributes<UserStatus>> {
  declare status_id: CreationOptional<number>;
  declare status_name: string;
}

export class Ability extends Model<InferAttributes<Ability>, InferCreationAttributes<Ability>> {
  declare ability_id: CreationOptional<number>;
  declare ability_name: string;
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare user_id: number;
  declare reg_data: Date;
  declare referral_id?: number;
  declare user_name?: string;
  declare first_name?: string;
  declare user_status: number;
}

export class UserAbility extends Model<InferAttributes<UserAbility>, InferCreationAttributes<UserAbility>> {
  declare user_id: number;
  declare click_coast_level: CreationOptional<number>;
  declare energy_level: CreationOptional<number>;
  declare energy_regeniration_level: CreationOptional<number>;
}
