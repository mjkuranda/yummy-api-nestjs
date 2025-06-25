import { Provider } from '@nestjs/common';
import { MongooseDatabaseConnectionListenerProvider } from './mongo-database-connection-listener.provider';

export const mongoDatabaseProviders: Provider[] = [
    MongooseDatabaseConnectionListenerProvider
];