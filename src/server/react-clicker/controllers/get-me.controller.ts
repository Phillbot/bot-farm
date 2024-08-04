import { Request, Response } from 'express';

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = req?.user;

    if (!user) {
      res.status(404).json({ ok: true, error: 'User not found' });
      return;
    }

    res.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
