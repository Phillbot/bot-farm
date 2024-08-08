import { Request, Response } from 'express';
import { container } from '@config/inversify.config';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { Logger } from '@helpers/logger';

export async function updateBoost(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    const { lastBoostRun } = req.body;

    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    if (typeof lastBoostRun !== 'number') {
      res.status(400).json({ ok: false, error: 'Invalid lastBoostRun value' });
      return;
    }

    const playerService = container.get<ReactClickerBotPlayerService>(ReactClickerBotPlayerService);
    await playerService.updateUserBoost(Number(user.id), lastBoostRun);

    res.status(200).json({ ok: true, message: 'Boost updated successfully' });
  } catch (error) {
    container.get<Logger>(Logger).error('Error in updateBoost:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
