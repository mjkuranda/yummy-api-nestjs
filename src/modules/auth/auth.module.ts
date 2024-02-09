import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_ACTION_MODEL, USER_MODEL } from '../../constants/models.constant';
import { UserRepository } from '../../mongodb/repositories/user.repository';
import { UserActionRepository } from '../../mongodb/repositories/user.action.repository';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        MongooseModule.forFeature([USER_MODEL, USER_ACTION_MODEL]),
        JwtManagerModule,
        RedisModule
    ],
    providers: [AuthService, UserRepository, UserActionRepository],
    exports: [AuthService]
})
export class AuthModule {}
