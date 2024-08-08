import { Request, Response } from 'express';
import { container } from '@config/inversify.config';
import { Logger } from '@helpers/logger';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';

export async function updateBalance(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    const { balance } = req.body;

    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    if (typeof balance !== 'number') {
      res.status(400).json({ ok: false, error: 'Invalid balance value' });
      return;
    }

    const playerService = container.get<ReactClickerBotPlayerService>(ReactClickerBotPlayerService);
    const userData = await playerService.getUserData(Number(user.id));

    if (!userData) {
      res.status(404).json({ ok: false, error: 'Player data not found' });
      return;
    }

    const newBalance = userData.balance + balance;
    await playerService.updateUser(Number(user.id), { balance: newBalance });

    res.status(200).json({ ok: true, newBalance });
  } catch (error) {
    container.get<Logger>(Logger).error('Error in updateBalance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
