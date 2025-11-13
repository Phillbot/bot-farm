import { Server } from 'http';
import path from 'path';

import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { inject, injectable, optional } from 'inversify';

import type { RequestLimitConfig } from '@config/environment';
import { LoggerToken, PORT, RequestLimitConfigSymbol } from '@config/symbols';

import { GlobalUtils } from '@helpers/global-utils';
import { Logger } from '@helpers/logger';

import { ApiRouter } from './api.router';
import { HealthService } from './health/health.service';
import { LandingRouter } from './landing/landing.router';
import { ReactClickerBotRouter } from './react-clicker/react-clicker.router';

const defaultPort = 8080;

@injectable()
export class ExpressApp {
  private readonly _app: Application;
  private readonly _port: number;
  private _server?: Server;

  constructor(
    @inject(PORT.$)
    port: number,
    private readonly _globalUtils: GlobalUtils,
    @inject(LoggerToken.$)
    private readonly _logger: Logger,
    @inject(RequestLimitConfigSymbol.$)
    private readonly _requestLimitConfig: RequestLimitConfig,
    private readonly _healthService: HealthService,
    private readonly _apiRouter: ApiRouter,
    private readonly _landingRouter: LandingRouter,
    @optional()
    private readonly _reactClickerBotRouter?: ReactClickerBotRouter,
  ) {
    this._port = port ?? defaultPort;
    this._app = express();

    this.setupMiddleware();
    this.setupViews();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    const limiter = rateLimit({
      windowMs: this._requestLimitConfig.windowMs,
      max: this._requestLimitConfig.max,
      message: {
        success: false,
        message: 'Too many requests, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this._app.use(cors());
    this._app.use(limiter);
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));
  }

  private setupViews(): void {
    this._app.set('views', path.resolve(process.cwd(), 'src/server/views'));
    this._app.set('view engine', 'ejs');
    this._app.use(express.static(path.resolve(process.cwd(), 'public')));
  }

  private setupRoutes(): void {
    this._app.get('/internal/health', this.handleHealthCheck);

    this._app.use('/api', this._apiRouter.router);

    if (this._reactClickerBotRouter) {
      this._app.use('/react-clicker-bot', this._reactClickerBotRouter.router);
    }

    this._app.use(this._landingRouter.router);

    this.registerErrorHandlers();
  }

  private registerErrorHandlers(): void {
    this._app.use((req: Request, res: Response) => {
      if (req.method === 'GET') {
        res.status(404).send('Not Found');
        return;
      }

      res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
      });
    });

    this._app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        next(err);
        return;
      }

      this._logger.error('Unhandled Express error', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    });
  }

  private handleHealthCheck = async (_: Request, res: Response): Promise<void> => {
    try {
      const snapshot = await this._healthService.getSnapshot();
      res.status(snapshot.status === 'ok' ? 200 : 503).json(snapshot);
    } catch (error) {
      this._logger.error('Failed to collect health snapshot', error);
      res.status(500).json({ status: 'error', message: 'Health check failed' });
    }
  };

  public async start(): Promise<void> {
    if (this._server) {
      this._logger.warn(`Express server is already running on port ${this._port}`);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const server = this._app.listen(this._port, () => {
        void this.logStartupMessage();
        resolve();
      });

      server.on('error', (error) => {
        this._logger.error('Failed to start Express server', error);
        reject(error);
      });

      this._server = server;
    });
  }

  private async logStartupMessage(): Promise<void> {
    try {
      const cat = await this._globalUtils.getRandomCat();
      this._logger.info({
        server: ExpressApp.name,
        status: 'ok',
        port: this._port,
        cat: cat?.url,
      });
    } catch (error) {
      this._logger.error('Express server started but failed to fetch cat image', error);
    }
  }

  public get app(): Application {
    return this._app;
  }
}
