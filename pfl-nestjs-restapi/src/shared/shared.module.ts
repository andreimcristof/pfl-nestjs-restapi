import { Module, Global } from '@nestjs/common';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [LoggingModule],
})
export class SharedModule {}
