import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDatabaseModule } from '../database/mongo/mongo-database.module';
import { MongoSyncService } from './mongo-sync.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
        LoggerModule,
        ConfigModule.forRoot({
            envFilePath: ['.env'],
        }),
        MongoDatabaseModule
    ],
    providers: [MongoSyncService],
})
export class MongoSyncModule {}
