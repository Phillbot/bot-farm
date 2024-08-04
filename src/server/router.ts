import { Request, Response, Router } from 'express';
import { Random } from 'some-random-cat';

export const router = Router();

// TODO: common api router

router.get('/*', async (_: Request, res: Response) => {
  const cat = await Random.getCat();

  res.send(
    `
    <div>
      <a href=${process.env.CONTACT_URL} target='_blank'>Telegram</a>
      <img src=${cat?.url} alt='cat' />
    </div>
    `,
  );
});
