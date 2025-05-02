import { NestFactory } from '@nestjs/core';
import { MongoSyncModule } from '../modules/mongo-sync/mongo-sync.module';
import { MongoSyncService } from '../modules/mongo-sync/mongo-sync.service';

(async () => {
    const app = await NestFactory.createApplicationContext(MongoSyncModule);

    const mongoSyncService = app.get(MongoSyncService);
    await mongoSyncService.synchronizeIndexes();

    await app.close();
})();