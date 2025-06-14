import { Module } from '@nestjs/common';
import { UserController } from './infrastructure/controllers/user.controller';
import { UserFacade } from './application/user.facade';

@Module({
    imports: [UserFacade],
    controllers: [UserController],
})
export class UserModule {}
