import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export enum REACT_CLICKER_PLAYERS_DB_CONNECTION_DATA {
  SCHEMA = 'players',
  TABLE_USERS = 'users',
  TABLE_USER_STATUSES = 'user_statuses',
  TABLE_ABILITIES = 'abilities',
  TABLE_USER_ABILITIES = 'user_abilities',
  TABLE_USER_REFERRALS = 'referrals',
  TABLE_ACTIVE_ENERGY = 'active_energy_by_user',
  TABLE_LAST_SESSIONS = 'last_sessions',
  TABLE_BOOSTS = 'boosts',
}

export class UserStatus extends Model<InferAttributes<UserStatus>, InferCreationAttributes<UserStatus>> {
  declare status_id: CreationOptional<number>;
  declare status_name: string;
}

export class Boost extends Model<InferAttributes<Boost>, InferCreationAttributes<Boost>> {
  declare user_id: CreationOptional<number>;
  declare last_boost_run: number;
}

export class Ability extends Model<InferAttributes<Ability>, InferCreationAttributes<Ability>> {
  declare ability_id: CreationOptional<number>;
  declare ability_name: string;
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare user_id: number;
  declare reg_data: number;
  declare referral_id?: number;
  declare user_name?: string;
  declare first_name?: string;
  declare user_status: number;
  declare balance: CreationOptional<number>;
}

export class Referral extends Model<InferAttributes<Referral>, InferCreationAttributes<Referral>> {
  declare user_id: number;
  declare referred_user_id: number;
  declare reward_claim: boolean;
}

export class UserAbility extends Model<InferAttributes<UserAbility>, InferCreationAttributes<UserAbility>> {
  declare user_id: number;
  declare click_coast_level: CreationOptional<number>;
  declare energy_level: CreationOptional<number>;
  declare energy_regeniration_level: CreationOptional<number>;
}

export class ActiveEnergyByUser extends Model<
  InferAttributes<ActiveEnergyByUser>,
  InferCreationAttributes<ActiveEnergyByUser>
> {
  declare user_id: number;
  declare active_energy: CreationOptional<number>;
}

export class LastSession extends Model<InferAttributes<LastSession>, InferCreationAttributes<LastSession>> {
  declare user_id: number;
  declare last_login: CreationOptional<number>;
  declare last_logout: CreationOptional<number>;
}
