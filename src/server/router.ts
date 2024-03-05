import express, { Request, Response } from 'express';
import { Random } from 'some-random-cat';

import { version } from '../../package.json';

// TODO: ? we need it? rework with class and add middlewares?
export const router = (app: express.Application): void => {
  app.get('/*', async (_: Request, res: Response) => {
    const cat = await Random.getCat();

    res.json({
      version,
      w: process.env.CONTACT_URL,
      cat,
    });
  });
};
