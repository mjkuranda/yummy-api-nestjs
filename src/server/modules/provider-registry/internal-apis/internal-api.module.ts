import { Module } from '@nestjs/common';
import { internalApiModules } from './internal-api.modules';

@Module({
    imports: [...internalApiModules],
    exports: [...internalApiModules]
})
export class InternalApiModule {}