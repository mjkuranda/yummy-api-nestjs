import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDocument } from '../user/user.interface';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    async decode(jwtCookie: string): Promise<UserDocument> {
        return await this.authService.getAuthorizedUser(jwtCookie);
    }
}
