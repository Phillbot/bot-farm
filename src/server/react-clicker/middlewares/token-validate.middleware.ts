import crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { ReactClickerAppGameUrl } from '@telegram/react-clicker-bot/symbols';

import { SALT } from '../symbols';

@injectable()
export class TokenValidateMiddleware {
  private readonly ALLOWED_TIME_DIFFERENCE = 60000;
  private readonly MAX_HASHES = 1000;
  private readonly seenHashes = new Set<string>();

  constructor(
    @inject(ReactClickerAppGameUrl.$)
    private readonly _appGameUrl: string,
    @inject(SALT.$)
    private readonly _salt: string,
    @inject(LoggerToken.$)
    private readonly _logger: Logger,
  ) {
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const headers = req.headers;
      const token = headers['x-token'] as string | undefined;
      const origin = headers['origin'];
      const timestamp = parseInt(headers['x-timestamp'] as string, 10);

      // Validate origin and token existence
      if (origin !== this._appGameUrl || !token || isNaN(timestamp)) {
        this.respondWithUnauthorized(res, 'Unauthorized: invalid request');
        return;
      }

      // Validate timestamp
      const currentTime = Date.now();
      const timeDifference = Math.abs(currentTime - timestamp);

      if (timeDifference > this.ALLOWED_TIME_DIFFERENCE) {
        this.respondWithUnauthorized(res, 'Unauthorized: request timed out');
        return;
      }

      // Generate the SHA256 hash to compare with the token
      const dataToHash = `${this._salt}${timestamp}${timestamp % 2 === 0 ? '{' : '}'}${req.body.initData}`;
      const generatedHash = crypto.createHmac('sha256', this._salt).update(dataToHash).digest('hex');

      // Check if the hash has already been seen
      if (this.seenHashes.has(generatedHash)) {
        this.respondWithUnauthorized(res, 'Unauthorized: duplicate request');
        return;
      }

      // Check and remove the oldest hash if the set exceeds the limit
      if (this.seenHashes.size >= this.MAX_HASHES) {
        const oldestHash = this.seenHashes.values().next().value ?? '';
        this.seenHashes.delete(oldestHash);
      }

      // Add the hash to the seen hashes
      this.seenHashes.add(generatedHash);

      // Compare the generated hash with the token from the header
      if (generatedHash !== token) {
        this.respondWithUnauthorized(res, 'Unauthorized: invalid token');
        return;
      }

      // If everything is valid, proceed to the next middleware or route handler
      next();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private respondWithUnauthorized(res: Response, message: string): void {
    res.status(403).json({ success: false, message });
  }

  private handleError(res: Response, error: unknown): void {
    if (error instanceof Error) {
      this._logger.error('Token validation middleware error:', error);
    } else {
      this._logger.error('Unknown error in Token validation middleware:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
