import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { MEGABYTE } from '../../constants/sizes.constant';
import { SECOND_IN_MILLISECONDS } from '../../constants/times.constant';

@Injectable()
export class NotificationService {

    constructor(private readonly loggerService: LoggerService) {
        setInterval(() => this.memoryUsage(), 30 * SECOND_IN_MILLISECONDS);
    }

    private memoryUsage() {
        const memoryUsage = process.memoryUsage();
        const heapUsedInMB = memoryUsage.heapUsed / MEGABYTE;
        const heapTotalInMB = memoryUsage.heapTotal / MEGABYTE;
        const rssInMB = memoryUsage.rss / MEGABYTE;

        this.loggerService.info(
            'NotificationService/memoryUsage',
            `Memory usage: RSS: ${rssInMB.toFixed(2)} MB, Heap used: ${heapUsedInMB.toFixed(2)} MB, Heap total: ${heapTotalInMB.toFixed(2)} MB`
        );
    }
}