import { Request, Response } from 'express';
import { container } from '@config/inversify.config';
import { Logger } from '@helpers/logger';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';

export async function updateEnergy(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    const { activeEnergy } = req.body;

    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    if (typeof activeEnergy !== 'number') {
      res.status(400).json({ ok: false, error: 'Invalid activeEnergy value' });
      return;
    }

    const playerService = container.get<ReactClickerBotPlayerService>(ReactClickerBotPlayerService);
    const userData = await playerService.getUserData(Number(user.id));

    if (!userData) {
      res.status(404).json({ ok: false, error: 'Player data not found' });
      return;
    }

    await playerService.updateUserActiveEnergy(Number(user.id), { active_energy: activeEnergy });

    res.status(200).json({ ok: true, activeEnergy });
  } catch (error) {
    container.get<Logger>(Logger).error('Error in updateEnergy:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
