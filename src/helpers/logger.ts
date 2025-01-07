import { LogLevel } from '@config/symbols';
import { inject, injectable } from 'inversify';

export enum LOG_LEVEL {
  FULL = 'FULL',
  COMPACT = 'COMPACT',
  NONE = 'NONE',
}

export enum LOG_TYPE {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

// TODO: Make symbol for dynamically logger injections

@injectable()
export class Logger {
  constructor(
    @inject(LogLevel.$)
    private readonly _logLevel: LOG_LEVEL,
  ) {}

  info(message: string | object, ...optionalParams: any[]): void {
    this.log(LOG_TYPE.INFO, message, ...optionalParams);
  }

  warn(message: string | object, ...optionalParams: any[]): void {
    this.log(LOG_TYPE.WARN, message, ...optionalParams);
  }

  error(message: string | object, ...optionalParams: any[]): void {
    this.log(LOG_TYPE.ERROR, message, ...optionalParams);
  }

  debug(message: string | object, ...optionalParams: any[]): void {
    this.log(LOG_TYPE.DEBUG, message, ...optionalParams);
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

  private log(type: LOG_TYPE, message: string | object, ...optionalParams: any[]): void {
    if (this._logLevel === LOG_LEVEL.NONE) {
      return;
    }

    const formatMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;

    switch (type) {
      case LOG_TYPE.INFO:
        if (this._logLevel === LOG_LEVEL.FULL || this._logLevel === LOG_LEVEL.COMPACT) {
          console.info(this.formatMessage(type, formatMessage), ...optionalParams);
        }
        break;
      case LOG_TYPE.WARN:
        if (this._logLevel === LOG_LEVEL.FULL || this._logLevel === LOG_LEVEL.COMPACT) {
          console.warn(this.formatMessage(type, formatMessage), ...optionalParams);
        }
        break;
      case LOG_TYPE.ERROR:
        if (this._logLevel === LOG_LEVEL.FULL || this._logLevel === LOG_LEVEL.COMPACT) {
          console.error(this.formatMessage(type, formatMessage), ...optionalParams);
        }
        break;
      case LOG_TYPE.DEBUG:
        if (this._logLevel === LOG_LEVEL.FULL) {
          console.debug(this.formatMessage(type, formatMessage), ...optionalParams);
        }
        break;
    }
  }

  private formatMessage(level: LOG_TYPE, message: string): string {
    const timestamp = new Date().toISOString();

    const getColor = () => {
      switch (level) {
        case LOG_TYPE.INFO:
          return '\x1b[34m'; // Blue
        case LOG_TYPE.WARN:
          return '\x1b[33m'; // Yellow
        case LOG_TYPE.ERROR:
          return '\x1b[31m'; // Red
        case LOG_TYPE.DEBUG:
          return '\x1b[32m'; // Green
      }
    };

    return `${getColor()}[${timestamp}] [${level}] ${message}\x1b[0m`; // Reset color
  }
}
