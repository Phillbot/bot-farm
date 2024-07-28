import { injectable } from 'inversify';

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

@injectable()
export class Logger {
  static logLevel: LOG_LEVEL = process.env.LOG_LEVEL as LOG_LEVEL;

  static info(message: string | object, ...optionalParams: any[]): void {
    Logger.log(LOG_TYPE.INFO, message, ...optionalParams);
  }

  static warn(message: string | object, ...optionalParams: any[]): void {
    Logger.log(LOG_TYPE.WARN, message, ...optionalParams);
  }

  static error(message: string | object, ...optionalParams: any[]): void {
    Logger.log(LOG_TYPE.ERROR, message, ...optionalParams);
  }

  static debug(message: string | object, ...optionalParams: any[]): void {
    Logger.log(LOG_TYPE.DEBUG, message, ...optionalParams);
  }

  static table(data: any, columns?: string[]): void {
    if (Logger.logLevel === LOG_LEVEL.NONE) {
      return;
    }

    if (columns) {
      console.table(data, columns);
    } else {
      console.table(data);
    }
  }

  private static log(type: LOG_TYPE, message: string | object, ...optionalParams: any[]): void {
    if (Logger.logLevel === LOG_LEVEL.NONE) {
      return;
    }

    const formatMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;

    switch (type) {
      case LOG_TYPE.INFO:
        if (Logger.logLevel === LOG_LEVEL.FULL || Logger.logLevel === LOG_LEVEL.COMPACT) {
          console.info(Logger.formatMessage(type, formatMessage), ...optionalParams);
        }
        break;
      case LOG_TYPE.WARN:
        if (Logger.logLevel === LOG_LEVEL.FULL || Logger.logLevel === LOG_LEVEL.COMPACT) {
          console.warn(Logger.formatMessage(type, formatMessage), ...optionalParams);
        }
        break;
      case LOG_TYPE.ERROR:
        if (Logger.logLevel === LOG_LEVEL.FULL || Logger.logLevel === LOG_LEVEL.COMPACT) {
          console.error(Logger.formatMessage(type, formatMessage), ...optionalParams);
        }
        break;
      case LOG_TYPE.DEBUG:
        if (Logger.logLevel === LOG_LEVEL.FULL) {
          console.debug(Logger.formatMessage(type, formatMessage), ...optionalParams);
        }
        break;
    }
  }

  private static formatMessage(level: LOG_TYPE, message: string): string {
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
