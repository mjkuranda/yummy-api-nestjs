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
        console.log('PRE', logger.transports.length);
        this.updateFileTransport();
        console.log('POST', logger.transports.length);
    }

    public log(level, message): void {
        console.log('XXX', this.logger.transports.length);
        if (this.shouldCreateNewFileTransport()) {
            this.updateFileTransport();
        }

        console.log(this.logger.transports.length);

        this.logger.log(level, message);
    }

    private updateFileTransport(): void {
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