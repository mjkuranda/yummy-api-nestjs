import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { UserService } from '../user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { UserSchema } from '../user/user.schema';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.USER_MODEL, schema: UserSchema },
        ]),
        UserModule,
        JwtManagerModule
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}
