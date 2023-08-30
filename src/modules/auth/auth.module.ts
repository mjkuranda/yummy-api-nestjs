import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { models } from '../../constants/models.constant';
import { UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.USER_MODEL, schema: UserSchema }
        ]),
        JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET }),
        UserModule
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService]
})
export class AuthModule {}
