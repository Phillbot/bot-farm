import { injectable } from 'inversify';
import { Transaction } from 'sequelize';
import { Logger } from '@helpers/logger';
import { ActiveEnergyByUser, LastSession, User, UserAbility } from './react-clicker-bot.models';
import { ReactClickerBotSequelize } from './react-clicker-bot.db';
import {
  AbilityType,
  ExtendedUser,
  ReferralUser,
  getClickCostUpgradeCost,
  getEnergyLimitUpgradeCost,
  getEnergyRegenUpgradeCost,
} from './types';

@injectable()
export class ReactClickerBotPlayerService {
  constructor(
    private readonly _reactClickerBotSequelize: ReactClickerBotSequelize,
    private readonly _logger: Logger,
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
    try {
      // Step 1: fetch all referral records for the given user_id.
      const referrals = await this._reactClickerBotSequelize.referrals.findAll({
        where: { user_id },
        attributes: ['referred_user_id', 'reward_claim'], // Include reward_claim to know whether the bonus was claimed.
      });

      // Step 2: extract every referred_user_id from those records.
      const referredUserIds = referrals.map((referral) => referral.referred_user_id);

      // Step 3: fetch user data for each referred account.
      const referredUsers = await this._reactClickerBotSequelize.user.findAll({
        where: {
          user_id: referredUserIds,
        },
      });

      // Step 4: compose an array with user info and the reward meta.
      const result = referredUsers.map((user) => {
        const referral = referrals.find((ref) => ref.referred_user_id === user.user_id);
        return {
          ...user.toJSON(),
          reward_claim: referral?.reward_claim, // Keep whether the reward was claimed in the response.
        };
      });

      // Step 5: return the enriched list.
      return result;
    } catch (error) {
      this._logger.error('Error fetching user referrals:', error);
      throw error;
    }
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
          referrals: referrals ?? [],
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
  ): Promise<{ balance: number; abilities: UserAbility; active_energy: number }> {
    const transaction = await this._reactClickerBotSequelize.sequelize.transaction();

    try {
      const user = await this.getUserById(user_id);
      const abilities = await this.getUserAbilities(user_id);
      const activeEnergy = await this.getUserActiveEnergy(user_id);

      if (!user || !abilities || !activeEnergy) {
        throw new Error('User, abilities, or active energy not found');
      }

      let cost;

      switch (abilityType) {
        case AbilityType.ClickCost:
          cost = getClickCostUpgradeCost(abilities.click_coast_level);
          if (user.balance < cost) {
            throw new Error('Insufficient balance');
          }
          if (abilities.click_coast_level < 20) {
            abilities.click_coast_level += 1;
          }
          break;
        case AbilityType.EnergyLimit:
          cost = getEnergyLimitUpgradeCost(abilities.energy_level);
          if (user.balance < cost) {
            throw new Error('Insufficient balance');
          }
          if (abilities.energy_level < 10) {
            abilities.energy_level += 1;
          }
          break;
        case AbilityType.EnergyRegen:
          cost = getEnergyRegenUpgradeCost(abilities.energy_regeniration_level);
          if (user.balance < cost) {
            throw new Error('Insufficient balance');
          }
          if (abilities.energy_regeniration_level < 5) {
            abilities.energy_regeniration_level += 1;
          }
          break;
        default:
          throw new Error('Unknown ability type');
      }

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

      if (abilityType === AbilityType.EnergyLimit) {
        await this._reactClickerBotSequelize.activeEnergy.update(
          { active_energy: abilities.energy_level * 1000 },
          { where: { user_id }, transaction },
        );
      }

      await transaction.commit();
      return {
        balance: user.balance,
        abilities,
        active_energy: abilityType === AbilityType.EnergyLimit ? abilities.energy_level * 1000 : -1,
      };
    } catch (error) {
      await transaction.rollback();

      // Check for insufficient balance error using type assertion
      if (error instanceof Error && error.message === 'Insufficient balance') {
        this._logger.warn(`User ${user_id} has insufficient balance for ${abilityType}`);
        throw new Error('INSUFFICIENT_BALANCE');
      }

      this._logger.error('Error in updateAbility:', error);
      throw error;
    }
  }
  public async updateReferrals(referralId: number, referredUserId: number): Promise<void> {
    try {
      await this._reactClickerBotSequelize.referrals.create({
        user_id: referralId, // Who sent the invite.
        referred_user_id: referredUserId, // Who was invited.
        reward_claim: false,
      });
    } catch (error) {
      this._logger.error('Error updating referrals:', error);
      throw error;
    }
  }

  public async updateLastLogin(user_id: number, last_login: number): Promise<void> {
    try {
      await this._reactClickerBotSequelize.lastSession.update({ last_login }, { where: { user_id } });
    } catch (error) {
      this._logger.error('Error updating last login:', error);
      throw error;
    }
  }

  public async claimReferralReward(
    user_id: number,
    referred_user_id: number,
  ): Promise<{ balance: number; referrals: ReferralUser[] }> {
    const transaction = await this._reactClickerBotSequelize.sequelize.transaction();

    try {
      // Step 1: locate the referral record.
      const referral = await this._reactClickerBotSequelize.referrals.findOne({
        where: { user_id, referred_user_id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!referral) {
        throw new Error('Referral not found');
      }

      // Step 2: check whether the reward is already claimed.
      if (referral.reward_claim) {
        throw new Error('Reward already claimed');
      }

      // Step 3: mark the reward as claimed.
      referral.reward_claim = true;
      await referral.save({ transaction });

      // Step 4: grant +1000 points to the user who invited the friend.
      const user = await this._reactClickerBotSequelize.user.findOne({
        where: { user_id },
        transaction,
      });

      if (!user) {
        throw new Error('User not found');
      }

      user.balance += 1000;
      await user.save({ transaction });

      // Step 5: commit the transaction.
      await transaction.commit();

      // Step 6: fetch the updated referral list.
      const updatedReferrals = await this.getUserReferrals(user_id);

      // Return the new balance together with the updated referrals.
      return { balance: user.balance, referrals: updatedReferrals };
    } catch (error) {
      await transaction.rollback();
      this._logger.error('Error claiming referral reward:', error);
      throw error;
    }
  }
}
