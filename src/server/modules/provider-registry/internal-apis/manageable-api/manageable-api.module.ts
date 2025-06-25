import { Module } from '@nestjs/common';
import { MongoDatabaseModule } from '../../../database/mongo/mongo-database.module';
import { REPOSITORIES_PROVIDERS } from '../internal-api.providers';
import { API_PROVIDERS } from './manageable-api.providers';

@Module({
    imports: [MongoDatabaseModule],
    providers: [...API_PROVIDERS, ...REPOSITORIES_PROVIDERS],
    exports: [...API_PROVIDERS]
})
export class ManageableApiModule {}