import { inject, injectable } from 'inversify';
import { Transaction } from 'sequelize';
import { Logger } from '@helpers/logger';
import { ActiveEnergyByUser, LastSession, User, UserAbility } from './react-clicker-bot.models';
import { ReactClickerBotSequelize } from './react-clicker-bot.db';
import { AbilityType, ExtendedUser } from './types';

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
      const boost = await this.getUserBoost(user_id);

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
          boost: boost ?? undefined,
        };

        return extendedUser;
      }

      return null;
    } catch (e) {
      this._logger.error(JSON.stringify(e));
      return null;
    }
  }

  public async updateBalanceAndLogout(
    user_id: number,
    balance: number,
    lastLogout: number,
    lastLogin: number,
    activeEnergy: number,
  ) {
    const transaction = await this._reactClickerBotSequelize.sequelize.transaction();
    try {
      await this._reactClickerBotSequelize.user.update({ balance }, { where: { user_id }, transaction });

      await this._reactClickerBotSequelize.lastSession.update(
        { last_logout: lastLogout, last_login: lastLogin },
        { where: { user_id }, transaction },
      );

      await this._reactClickerBotSequelize.activeEnergy.update(
        { active_energy: activeEnergy },
        { where: { user_id }, transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      this._logger.error(JSON.stringify(error));
      throw error;
    }
  }

  public async getUserBoost(user_id: number) {
    return this._reactClickerBotSequelize.boost.findOne({ where: { user_id } }).catch((e) => this._logger.error(e));
  }

  public async updateUserBoost(user_id: number, last_boost_run: number) {
    return this._reactClickerBotSequelize.boost.upsert({ user_id, last_boost_run }).catch((e) => this._logger.error(e));
  }

  public async updateAbility(
    user_id: number,
    abilityType: AbilityType,
  ): Promise<{ balance: number; abilities: UserAbility }> {
    const transaction = await this._reactClickerBotSequelize.sequelize.transaction();

    try {
      const user = await this.getUserById(user_id);
      const abilities = await this.getUserAbilities(user_id);

      if (!user || !abilities) {
        throw new Error('User or abilities not found');
      }

      let cost;
      switch (abilityType) {
        case AbilityType.ClickCost:
          cost = this.getClickCostUpgradeCost(abilities.click_coast_level);
          if (user.balance >= cost && abilities.click_coast_level < 20) {
            abilities.click_coast_level += 1;
          }
          break;
        case AbilityType.EnergyLimit:
          cost = this.getEnergyLimitUpgradeCost(abilities.energy_level);
          if (user.balance >= cost && abilities.energy_level < 10) {
            abilities.energy_level += 1;
          }
          break;
        case AbilityType.EnergyRegen:
          cost = this.getEnergyRegenUpgradeCost(abilities.energy_regeniration_level);
          if (user.balance >= cost && abilities.energy_regeniration_level < 5) {
            abilities.energy_regeniration_level += 1;
          }
          break;
        default:
          throw new Error('Unknown ability type');
      }

      if (user.balance >= cost) {
        user.balance -= cost;
        await user.save({ transaction });
        await this._reactClickerBotSequelize.userAbility.update(
          {
            click_coast_level: abilities.click_coast_level,
            energy_level: abilities.energy_level,
            energy_regeniration_level: abilities.energy_regeniration_level,
          },
          { where: { user_id }, transaction },
        );
      }

      await transaction.commit();
      return { balance: user.balance, abilities };
    } catch (error) {
      await transaction.rollback();
      this._logger.error('Error in updateAbility:', error);
      throw error;
    }
  }
  private getClickCostUpgradeCost(level: number): number {
    const costMap = new Map<number, number>([
      [1, 1000],
      [2, 2000],
      [3, 4000],
      [4, 8000],
      [5, 12500],
      [6, 15000],
      [7, 17500],
      [8, 20000],
      [9, 30000],
      [10, 50000],
      [11, 100000],
      [12, 125000],
      [13, 150000],
      [14, 175000],
      [15, 200000],
      [16, 350000],
      [17, 500000],
      [18, 750000],
      [19, 1000000],
    ]);
    return costMap.get(level) || 0;
  }

  private getEnergyLimitUpgradeCost(level: number): number {
    const costMap = new Map<number, number>([
      [1, 5000],
      [2, 10000],
      [3, 15000],
      [4, 20000],
      [5, 25000],
      [6, 50000],
      [7, 75000],
      [8, 100000],
      [9, 125000],
    ]);
    return costMap.get(level) || 0;
  }

  private getEnergyRegenUpgradeCost(level: number): number {
    const costMap = new Map<number, number>([
      [1, 15000],
      [2, 20000],
      [3, 25000],
      [4, 50000],
    ]);
    return costMap.get(level) || 0;
  }
}
