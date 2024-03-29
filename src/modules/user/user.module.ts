import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_ACTION_MODEL, USER_MODEL } from '../../constants/models.constant';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RedisModule } from '../redis/redis.module';
import { MailManagerModule } from '../mail-manager/mail-manager.module';
import { UserRepository } from '../../mongodb/repositories/user.repository';
import { UserActionRepository } from '../../mongodb/repositories/user.action.repository';
import { RedisService } from '../redis/redis.service';
import { PasswordManagerModule } from '../password-manager/password-manager.module';

@Module({
    imports: [
        MongooseModule.forFeature([USER_MODEL, USER_ACTION_MODEL]),
        JwtManagerModule,
        RedisModule,
        MailManagerModule,
        PasswordManagerModule
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository, UserActionRepository, RedisService],
    exports: [UserService]
})
export class UserModule {}
