import { Module } from '@nestjs/common';
import { ProviderRegistryService } from './provider-registry.service';
import { ExternalApiModule } from './external-apis/external-api.module';
import { InternalApiModule } from './internal-apis/internal-api.module';
import { PROVIDABLE_SERVICES } from './providable.providers';

@Module({
    imports: [ExternalApiModule, InternalApiModule],
    providers: [ProviderRegistryService, ...PROVIDABLE_SERVICES],
    exports: [ProviderRegistryService]
})
export class ProviderRegistryModule {}