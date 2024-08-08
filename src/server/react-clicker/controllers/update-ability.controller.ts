import { Request, Response } from 'express';
import { container } from '@config/inversify.config';
import { Logger } from '@helpers/logger';
import { ReactClickerBotPlayerService } from '@database/react-clicker-bot/react-clicker-bot-player.service';
import { AbilityType } from '@database/react-clicker-bot/types';

export async function updateAbility(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    const { abilityType } = req.body;

    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    if (typeof abilityType !== 'number' || !Object.values(AbilityType).includes(abilityType)) {
      res.status(400).json({ ok: false, error: 'Invalid abilityType value' });
      return;
    }

    const playerService = container.get<ReactClickerBotPlayerService>(ReactClickerBotPlayerService);
    const userData = await playerService.getUserData(Number(user.id));

    if (!userData) {
      res.status(404).json({ ok: false, error: 'Player data not found' });
      return;
    }

    const updatedData = await playerService.updateAbility(userData.user_id, abilityType);

    res.status(200).json({ ok: true, balance: updatedData.balance, abilities: updatedData.abilities });
  } catch (error) {
    container.get<Logger>(Logger).error('Error in updateAbility:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
