import { Request, Response } from 'express';
import { container } from '@config/inversify.config';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { Logger } from '@helpers/logger';

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = req?.user;

    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    const playerService = container.get<ReactClickerBotPlayerService>(ReactClickerBotPlayerService);

    // Получаем все необходимые данные пользователя из одного запроса
    const userData = await playerService.getUserData(Number(user.id));

    if (!userData) {
      res.status(404).json({ ok: false, error: 'Player data not found' });
      return;
    }

    res.status(200).json({
      ok: true,
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
    container.get<Logger>(Logger).error('Error in getMe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
