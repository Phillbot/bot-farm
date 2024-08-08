import { Request, Response } from 'express';
import { container } from '@config/inversify.config';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { Logger } from '@helpers/logger';

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    const { balance, lastLogoutTimestamp, lastLoginTimestamp } = req.body;

    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    const playerService = container.get<ReactClickerBotPlayerService>(ReactClickerBotPlayerService);
    await playerService.updateBalanceAndLogout(
      Number(user.id),
      balance,
      new Date(lastLogoutTimestamp),
      new Date(lastLoginTimestamp),
    );

    res.status(200).json({ ok: true });
  } catch (error) {
    container.get<Logger>(Logger).error('Error in updateBalanceAndLogout:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
