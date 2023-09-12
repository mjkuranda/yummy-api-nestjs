import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { UserSchema } from './user.schema';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.USER_MODEL, schema: UserSchema },
        ]),
        JwtManagerModule,
        RedisModule
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
