import { Module } from '@nestjs/common';
import { userApplicationProviders } from './user-application.provider';
import { UserFacade } from './user.facade';

@Module({
    providers: [UserFacade, ...userApplicationProviders],
    exports: [UserFacade, ...userApplicationProviders]
})
export class UserApplicationModule {}