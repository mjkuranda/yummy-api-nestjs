import { Type } from '@nestjs/common';
import { ManageableApiModule } from './manageable-api/manageable-api.module';
import { ProvidableApiModule } from './providable-api/providable-api.module';

export const internalApiModules: Type[] = [
    ManageableApiModule,
    ProvidableApiModule
];