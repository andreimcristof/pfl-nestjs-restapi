import { Global, Module } from '@nestjs/common';
import { CustomLoggerService } from './logging.service';

// @Global()
@Module({
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggingModule {}
