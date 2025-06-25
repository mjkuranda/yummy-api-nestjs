import { Module } from '@nestjs/common';
import { MongoDatabaseModule } from '../../../database/mongo/mongo-database.module';
import { REPOSITORIES_PROVIDERS } from '../internal-api.providers';
import { ProvidableApiService } from './providable-api.service';

@Module({
    imports: [
        MongoDatabaseModule
    ],
    providers: [...REPOSITORIES_PROVIDERS, ProvidableApiService],
    exports: [...REPOSITORIES_PROVIDERS, ProvidableApiService]
})
export class ProvidableApiModule {}