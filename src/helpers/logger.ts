import { injectable } from 'inversify';

@injectable()
export class Logger {
  // eslint-disable-next-line
  static info(message: string | object, ...optionalParams: any[]): void {
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 2);
    }
    // eslint-disable-next-line
    console.info(Logger.formatMessage('INFO', message), ...optionalParams);
  }

  // eslint-disable-next-line
  static warn(message: string | object, ...optionalParams: any[]): void {
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 2);
    }
    // eslint-disable-next-line
    console.warn(Logger.formatMessage('WARN', message), ...optionalParams);
  }

  // eslint-disable-next-line
  static error(message: string | object, ...optionalParams: any[]): void {
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 2);
    }
    // eslint-disable-next-line
    console.error(Logger.formatMessage('ERROR', message), ...optionalParams);
  }

  // eslint-disable-next-line
  static debug(message: string | object, ...optionalParams: any[]): void {
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 2);
    }
    // eslint-disable-next-line
    console.debug(Logger.formatMessage('DEBUG', message), ...optionalParams);
  }

  // eslint-disable-next-line
  static table(data: any, columns?: string[]): void {
    if (columns) {
      // eslint-disable-next-line
      console.table(data, columns);
    } else {
      // eslint-disable-next-line
      console.table(data);
    }
  }

  private static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    let color = '';

    switch (level) {
      case 'INFO':
        color = '\x1b[34m'; // Blue
        break;
      case 'WARN':
        color = '\x1b[33m'; // Yellow
        break;
      case 'ERROR':
        color = '\x1b[31m'; // Red
        break;
      case 'DEBUG':
        color = '\x1b[32m'; // Green
        break;
    }

    return `${color}[${timestamp}] [${level}] ${message}\x1b[0m`; // Reset color
  }
}
