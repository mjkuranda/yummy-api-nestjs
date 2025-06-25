import { Connection, ConnectionStates } from 'mongoose';
import { LoggerService } from '../../logger/logger.service';
import { ContextString } from '../../../common/types';

export class MongoDatabaseConnectionListenerFactory {

    static create(connection: Connection, loggerService: LoggerService): void {
        const context: ContextString = 'MongoDatabase/instance';

        connection.on('connected', () => {
            loggerService.info(context, 'Mongoose connected successfully.');
        });

        connection.on('error', (err) => {
            loggerService.error(context, `Mongoose connection error: ${err.message}`);
        });

        // NOTE: If event was emitted earlier
        switch (connection.readyState) {
        case ConnectionStates.connected:
            loggerService.info(context, 'Mongoose connected successfully.');
            break;
        case ConnectionStates.disconnected:
            loggerService.error(context, 'Mongoose connection error.');
            break;
        }
    }
}