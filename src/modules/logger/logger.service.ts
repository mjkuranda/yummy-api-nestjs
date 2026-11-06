import { Inject, Injectable, LogLevel, LoggerService as NestLoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FileTransportInstance } from 'winston/lib/winston/transports';
import moment from 'moment';
import { ContextString } from '../../common/types';
import { loggerFileFactory } from './logger.factory';

@Injectable()
export class LoggerService implements NestLoggerService {

    private loggerTransport: FileTransportInstance;

    private currentDate: string;

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger
    ) {
        this.updateFileTransport();
        this.info('LoggerService/constructor', 'LoggerService is ready and starts logging.');
    }

    public log(message: string, context?: ContextString) {
        this.info(context, message);
    }

    public warn(message: string, context?: ContextString) {
        if (this.shouldCreateNewFileTransport()) {
            this.updateFileTransport();
        }
        
        this.logger.warn(this.getLogMessage(context, message));
    }
    
    public debug(message: string, context?: ContextString) {
        if (this.shouldCreateNewFileTransport()) {
            this.updateFileTransport();
        }

        this.logger.debug(this.getLogMessage(context, message));
    }

    public info(context: ContextString, message: string): void {
        if (this.shouldCreateNewFileTransport()) {
            this.updateFileTransport();
        }

        const logMessage = this.getLogMessage(context, message);
        this.logger.info(logMessage);
    }

    public error(context: ContextString, message: string): void {
        if (this.shouldCreateNewFileTransport()) {
            this.updateFileTransport();
        }

        const logMessage = this.getLogMessage(context, message);
        this.logger.error(logMessage);
    }

    private updateFileTransport(): void {
        if (this.loggerTransport) {
            this.logger.remove(this.loggerTransport);
        }

        this.loggerTransport = this.getFileTransport();
        this.logger.add(this.loggerTransport);
    }

    private getFileTransport(): FileTransportInstance {
        this.currentDate = moment().format('YYYY-MM-DD');

        return loggerFileFactory(this.currentDate);
    }

    private shouldCreateNewFileTransport(): boolean {
        const date = moment().format('YYYY-MM-DD');

        return date !== this.currentDate;
    }

    private getLogMessage(context: ContextString, message: string): string {
        return `${context}: ${message}`;
    }
}