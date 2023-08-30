import { Controller } from '@nestjs/common';
import { AuthResult } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    decode(jwtCookie: string): AuthResult {
        return this.authService.decode(jwtCookie);
    }
}
