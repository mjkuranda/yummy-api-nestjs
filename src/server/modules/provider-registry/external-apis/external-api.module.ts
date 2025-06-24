import { Module } from '@nestjs/common';
import { externalApiModules } from './external-api.modules';

@Module({
    imports: [...externalApiModules],
    exports: [...externalApiModules]
})
export class ExternalApiModule {}