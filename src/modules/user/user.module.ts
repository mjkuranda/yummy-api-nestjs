import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { UserSchema } from './user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.USER_MODEL, schema: UserSchema },
        ]),
        JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET })
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
