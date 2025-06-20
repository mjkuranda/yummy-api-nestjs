import { Module } from '@nestjs/common';
import { userDomainProviders } from './user-domain.provider';

@Module({
    providers: [...userDomainProviders],
    exports: [...userDomainProviders]
})
export class UserDomainModule {}