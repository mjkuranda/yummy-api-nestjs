import { Module } from '@nestjs/common';
import { mongoDatabaseImports } from './mongo-database.imports';
import { mongoDatabaseProviders } from './mongo-database.providers';

@Module({
    imports: [...mongoDatabaseImports],
    providers: [...mongoDatabaseProviders],
    exports: [...mongoDatabaseImports, ...mongoDatabaseProviders]
})
export class MongoDatabaseModule {}