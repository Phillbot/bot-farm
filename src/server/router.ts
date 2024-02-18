import express, { Request, Response } from 'express';
import { Random } from 'some-random-cat';

export const router = (app: express.Application): void => {
  app.get('/*', async (_: Request, res: Response) => {
    const cat = await Random.getCat();

    res.json({
      w: 'https://t.me/phillb0t',
      cat,
    });
  });
};
