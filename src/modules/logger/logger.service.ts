import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger, transports } from 'winston';
import { FileTransportInstance } from 'winston/lib/winston/transports';
import * as moment from 'moment';

@Injectable()
export class LoggerService {

    private loggerTransport: FileTransportInstance;

    private currentDate: string;

    constructor(@Inject(WINSTON_MODULE_PROVIDER)
                private logger: Logger) {
        this.updateFileTransport();
    }

    public log(level, message): void {
        if (this.shouldCreateNewFileTransport()) {
            this.updateFileTransport();
        }

        this.logger.log(level, message);
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

        return new transports.File({ level: 'error', filename: `logs/${this.currentDate}.log` })
    }

    private shouldCreateNewFileTransport(): boolean {
        const date = moment().format('YYYY-MM-DD');

        return date !== this.currentDate;
    }
}