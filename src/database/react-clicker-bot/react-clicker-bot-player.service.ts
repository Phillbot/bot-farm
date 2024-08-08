import { inject, injectable } from 'inversify';
import { Transaction } from 'sequelize';

import { Logger } from '@helpers/logger';

import { ActiveEnergyByUser, LastSession, Referral, User, UserAbility } from './types';
import { ReactClickerBotSequelize } from './react-clicker-bot.db';

interface ExtendedUser {
  user_id: number;
  reg_data: Date;
  referral_id?: number;
  user_name?: string;
  first_name?: string;
  user_status: number;
  balance: number;
  abilities?: UserAbility;
  referrals: Referral[];
  activeEnergy?: ActiveEnergyByUser;
  lastSession?: LastSession;
}

@injectable()
export class ReactClickerBotPlayerService {
  constructor(
    @inject(ReactClickerBotSequelize)
    private readonly _reactClickerBotSequelize: ReactClickerBotSequelize,
    @inject(Logger) private readonly _logger: Logger,
  ) {}

  public async getUserById(user_id: number) {
    return this._reactClickerBotSequelize.user.findOne({ where: { user_id } });
  }

  public async getAllUsers() {
    return this._reactClickerBotSequelize.user.findAll();
  }
  public async createUser(
    userData: Required<Pick<User, 'user_id' | 'reg_data' | 'user_name' | 'first_name' | 'user_status' | 'balance'>> &
      Partial<Pick<User, 'referral_id'>>,
  ) {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      const transaction = await this._reactClickerBotSequelize.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      });

      try {
        this._logger.info(`Starting transaction for user creation: ${userData.user_id}, attempt ${attempt + 1}`);

        // Проверяем существование пользователя с блокировкой строки
        const user = await this._reactClickerBotSequelize.user.findOne({
          where: { user_id: userData.user_id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (user) {
          this._logger.info(`User already exists: ${userData.user_id}`);
          await transaction.commit();
          return user;
        }

        // Создаем нового пользователя
        const newUser = await this._reactClickerBotSequelize.user.create(userData, { transaction });
        await transaction.commit();
        this._logger.info(`User created successfully: ${userData.user_id}`);
        return newUser;
      } catch (error) {
        await transaction.rollback();
        // @ts-expect-error next line
        if (error.name === 'SequelizeUniqueConstraintError') {
          this._logger.info(`User already exists (detected on create): ${userData.user_id}`);
          const existingUser = await this.getUserById(userData.user_id);
          if (existingUser) {
            return existingUser;
          }
        }
        // @ts-expect-error next line
        if (error.name === 'SequelizeDatabaseError' && error.parent.code === '40001') {
          // Обрабатываем конфликт сериализации
          this._logger.warn(
            `Serialization conflict detected for user creation: ${userData.user_id}, attempt ${attempt + 1}`,
          );
          attempt++;
          continue;
        }

        this._logger.error(`Error in transaction for user creation: ${userData.user_id}`);
        this._logger.error(JSON.stringify(error));
        throw error;
      }
    }

    this._logger.error(`Failed to create user after ${maxRetries} attempts: ${userData.user_id}`);
    throw new Error(`Failed to create user after ${maxRetries} attempts`);
  }
  public async updateUser(user_id: number, userData: Partial<User>) {
    return this._reactClickerBotSequelize.user.update(userData, { where: { user_id } });
  }

  public async deleteUser(user_id: number) {
    return this._reactClickerBotSequelize.user.destroy({ where: { user_id } });
  }

  public async getUserAbilities(user_id: number) {
    return this._reactClickerBotSequelize.userAbility.findOne({ where: { user_id } });
  }

  public async setUserAbilities(user_id: number, abilities: Partial<UserAbility>) {
    return this._reactClickerBotSequelize.userAbility.update(abilities, { where: { user_id } });
  }

  public async getUserReferrals(user_id: number) {
    return this._reactClickerBotSequelize.referrals.findAll({ where: { user_id } });
  }

  public async getUserActiveEnergy(user_id: number) {
    return this._reactClickerBotSequelize.activeEnergy.findOne({ where: { user_id } });
  }

  public async updateUserActiveEnergy(user_id: number, activeEnergy: Partial<ActiveEnergyByUser>) {
    return this._reactClickerBotSequelize.activeEnergy.update(activeEnergy, { where: { user_id } });
  }

  public async getUserLastSession(user_id: number) {
    return this._reactClickerBotSequelize.lastSession.findOne({ where: { user_id } });
  }

  public async updateUserLastSession(user_id: number, sessionData: Partial<LastSession>) {
    return this._reactClickerBotSequelize.lastSession.upsert({ user_id, ...sessionData });
  }

  public async getUserData(user_id: number): Promise<ExtendedUser | null> {
    try {
      const user = await this.getUserById(user_id);
      const abilities = await this.getUserAbilities(user_id);
      const referrals = await this.getUserReferrals(user_id);
      const activeEnergy = await this.getUserActiveEnergy(user_id);
      const lastSession = await this.getUserLastSession(user_id);

      if (user) {
        const extendedUser: ExtendedUser = {
          user_id: user.user_id,
          reg_data: user.reg_data,
          referral_id: user.referral_id,
          user_name: user.user_name,
          first_name: user.first_name,
          user_status: user.user_status,
          balance: user.balance,
          abilities: abilities ?? undefined,
          referrals: referrals ? referrals.map((referral) => referral.toJSON()) : [],
          activeEnergy: activeEnergy ?? undefined,
          lastSession: lastSession ?? undefined,
        };

        return extendedUser;
      }

      return null;
    } catch (e) {
      this._logger.error(JSON.stringify(e));
      return null;
    }
  }

  public async updateBalanceAndLogout(user_id: number, balance: number, lastLogout: Date, lastLogin: Date) {
    const transaction = await this._reactClickerBotSequelize.sequelize.transaction();
    try {
      await this._reactClickerBotSequelize.user.update({ balance }, { where: { user_id }, transaction });

      await this._reactClickerBotSequelize.lastSession.update(
        { last_logout: lastLogout, last_login: lastLogin },
        { where: { user_id }, transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      this._logger.error(JSON.stringify(error));
      throw error;
    }
  }
}
