import { Module } from '@nestjs/common';
import { UserApplicationModule } from './application/user-application.module';
import { UserAuthController, UserController, UserProfileController } from './presentation/controllers';

@Module({
    imports: [UserApplicationModule],
    controllers: [
        UserController,
        UserAuthController,
        UserProfileController
    ],
})
export class UserModule {}
