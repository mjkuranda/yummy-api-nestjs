import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RedisModule } from '../redis/redis.module';
import { MailManagerModule } from '../mail-manager/mail-manager.module';
import { UserActionSchema } from '../../schemas/user-action.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.USER_ACTION_MODEL, schema: UserActionSchema }
        ]),
        JwtManagerModule,
        RedisModule,
        MailManagerModule
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
