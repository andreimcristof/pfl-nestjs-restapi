import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import {
  addColors,
  config,
  createLogger,
  format,
  Logger,
  transports,
} from 'winston';

const winstonColors = {
  info: 'cyan',
  warn: 'orange',
  error: 'red',
  debug: 'green',
  verbose: 'black',
};
@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger: Logger;
  constructor() {
    const { combine, colorize, json, timestamp, prettyPrint, printf } = format;
    const logFormat = printf((info) => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    });
    this.logger = createLogger({
      level: 'debug',
      silent: false,
      transports: [new transports.Console()],
      format: combine(
        colorize({
          all: process.stdout.isTTY, // we only colorize the logs if this is console
          colors: winstonColors,
        }),
        json(),
        timestamp({
          format: new Date().toLocaleTimeString(),
        }),
        prettyPrint(),
        logFormat,
      ),
    });
    addColors(winstonColors as config.AbstractConfigSetColors);
  }
  log(message: any, ...optionalParams: any[]) {
    this.logger.log('info', message);
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
  }
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message);
  }
  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug(message);
  }
  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message);
  }
  setLogLevels?(levels: LogLevel[]) {
    throw new Error('Method not implemented.');
  }
}
