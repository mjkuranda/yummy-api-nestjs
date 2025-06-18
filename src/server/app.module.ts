import { Module } from '@nestjs/common';
import { configModules, domainModules, globalModules, systemModules } from './app.imports';

@Module({
    imports: [
        ...configModules,
        ...systemModules,
        ...globalModules,
        ...domainModules
    ]
})
export class AppModule {}
