import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';
import { inject, injectable } from 'inversify';

import { LogLevel } from '@config/symbols';

export enum LOG_LEVEL {
  FULL = 'FULL',
  COMPACT = 'COMPACT',
  NONE = 'NONE',
}

@injectable()
export class Logger {
  private readonly _pino: PinoLogger;
  private readonly _isPretty: boolean;

  constructor(
    @inject(LogLevel.$)
    private readonly _logLevel: LOG_LEVEL,
  ) {
    this._isPretty = Logger.shouldUsePretty();

    const options: LoggerOptions = {
      level: Logger.mapLevel(_logLevel),
      base: undefined,
      timestamp: this._isPretty ? false : pino.stdTimeFunctions.isoTime,
      formatters: {
        level(label) {
          return { level: label.toUpperCase() };
        },
      },
    };

    const transport = Logger.createTransport(this._isPretty);
    if (transport) {
      options.transport = transport;
    }

    this._pino = pino(options);
  }

  info(message: string | object, ...optionalParams: any[]): void {
    this._pino.info(message, ...optionalParams);
  }

  warn(message: string | object, ...optionalParams: any[]): void {
    this._pino.warn(message, ...optionalParams);
  }

  error(message: string | object, ...optionalParams: any[]): void {
    this._pino.error(message, ...optionalParams);
  }

  debug(message: string | object, ...optionalParams: any[]): void {
    this._pino.debug(message, ...optionalParams);
  }

  table(data: any, columns?: string[]): void {
    if (this._logLevel === LOG_LEVEL.NONE) {
      return;
    }

    if (columns) {
      console.table(data, columns);
    } else {
      console.table(data);
    }
  }

  private static mapLevel(level: LOG_LEVEL): LoggerOptions['level'] {
    switch (level) {
      case LOG_LEVEL.FULL:
        return 'debug';
      case LOG_LEVEL.COMPACT:
        return 'info';
      case LOG_LEVEL.NONE:
        return 'silent';
      default:
        return 'info';
    }
  }

  private static shouldUsePretty(): boolean {
    const explicitFlag = process.env.LOG_PRETTY?.toLowerCase();
    if (explicitFlag === 'true' || explicitFlag === '1' || explicitFlag === 'yes') {
      return true;
    }

    if (explicitFlag === 'false' || explicitFlag === '0' || explicitFlag === 'no') {
      return false;
    }

    return process.env.NODE_ENV !== 'production';
  }

  private static createTransport(enabled: boolean): LoggerOptions['transport'] | undefined {
    if (!enabled) {
      return undefined;
    }

    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        singleLine: false,
        ignore: 'pid,hostname',
      },
    };
  }
}
