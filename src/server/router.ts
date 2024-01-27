import express, { Request, Response } from 'express';

export const router = (app: express.Application): void => {
  app.get('/*', (_: Request, res: Response) => {
    res.json({
      w: 'https://t.me/phillb0t',
    });
  });
};
