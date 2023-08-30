import { Controller } from '@nestjs/common';
import { AuthResult } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    async decode(jwtCookie: string): Promise<AuthResult> {
        return await this.authService.getAnalysis(jwtCookie);
    }
}
