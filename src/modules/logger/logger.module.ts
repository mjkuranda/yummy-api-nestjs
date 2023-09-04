import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';
import { loggerConsoleFactory } from './logger.factory';

@Global()
@Module({
    imports: [
        WinstonModule.forRoot({ transports: [loggerConsoleFactory()] })
    ],
    providers: [LoggerService],
    exports: [LoggerService]
})
export class LoggerModule {}
