import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { transports } from 'winston';
import { LoggerService } from './logger.service';

@Global()
@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new transports.Console({ level: 'warn' })
            ]
        })
    ],
    providers: [LoggerService],
    exports: [LoggerService]
})
export class LoggerModule {}
