import { Module } from '@nestjs/common';
import { ProviderRegistryService } from './provider-registry.service';
import { providerRepositories, providerServices } from './provider.provider';

@Module({
    providers: [
        ...providerServices,
        ...providerRepositories,
        ProviderRegistryService
    ],
    exports: [ProviderRegistryService]
})
export class ProviderModule {}