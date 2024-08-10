import { Request, Response } from 'express';
import { container } from '@config/inversify.config';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { Logger } from '@helpers/logger';

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { referralId } = req?.body;
    const { user } = req;

    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    const playerService = container.get<ReactClickerBotPlayerService>(ReactClickerBotPlayerService);

    let validReferralId = undefined;
    if (referralId) {
      const referralUser = await playerService.getUserById(Number(referralId));
      if (referralUser && Number(referralId) !== Number(user.id)) {
        validReferralId = Number(referralId);
      } else {
        container.get<Logger>(Logger).warn(`Referral ID ${referralId} not found in the database.`);
      }
    }

    const newUser = {
      user_id: Number(user.id),
      reg_data: new Date().getTime(),
      user_name: user.userName || '',
      first_name: user.firstName || '',
      user_status: 1,
      referral_id: validReferralId,
      balance: 0,
    };

    const createdUser = await playerService.createUser(newUser);

    if (!createdUser) {
      res.status(500).json({ ok: false, error: 'Failed to create user' });
      return;
    }

    if (validReferralId) {
      await playerService.updateReferrals(validReferralId, Number(user.id));
    }

    // Загружаем полные данные пользователя после создания
    const userData = await playerService.getUserData(Number(user.id));

    if (!userData) {
      res.status(500).json({ ok: false, error: 'Failed to retrieve user data after creation' });
      return;
    }

    // Возвращаем данные созданного пользователя
    res.status(201).json({
      ok: true,
      message: 'User created successfully',
      user: {
        ...user,
        balance: userData.balance,
        status: userData.user_status,
        referral_id: userData.referral_id,
        abilities: userData.abilities,
        activeEnergy: userData.activeEnergy,
        lastLogout: userData.lastSession?.last_logout,
        referrals: userData.referrals,
        boost: userData.boost,
      },
    });
  } catch (error) {
    container.get<Logger>(Logger).error('Error in createUser:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
