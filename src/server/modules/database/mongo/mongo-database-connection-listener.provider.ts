import { Provider } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { LoggerService } from '../../logger/logger.service';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { MongoDatabaseConnectionListenerFactory } from './mongo-database-connection-listener.factory';

const MONGOOSE_DATABASE_CONNECTION_LISTENER: InjectionToken = 'MONGOOSE_DATABASE_CONNECTION_LISTENER';

export const MongooseDatabaseConnectionListenerProvider: Provider = {
    provide: MONGOOSE_DATABASE_CONNECTION_LISTENER,
    useFactory: (connection: Connection, loggerService: LoggerService) => MongoDatabaseConnectionListenerFactory.create(connection, loggerService),
    inject: [getConnectionToken(), LoggerService],
};