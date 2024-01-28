import express from 'express';
import { Random } from 'some-random-cat';

import { serverConfig } from './config';
import { router } from './router';

class ExpressApp {
  private readonly _app: express.Application;

  constructor() {
    this._app = express();
  }
  public listen(): void {
    this._app.listen(serverConfig.port, () => {
      try {
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));

        const greeting = async () => {
          const cat = await Random.getCat()
            .then((res) => res)
            .catch((e) => e);

          // eslint-disable-next-line
          await console.table({
            server: 'express',
            status: 'ok',
            port: serverConfig.port,
            cat: cat.url,
          });
        };

        greeting();

        router(this._app);
      } catch (error) {
        // eslint-disable-next-line
        console.table({ ok: false });
      }
    });
  }

  get instance() {
    return this._app;
  }
}

export const expressServer = new ExpressApp();
