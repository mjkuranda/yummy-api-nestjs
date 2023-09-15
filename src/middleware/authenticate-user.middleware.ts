import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class AuthenticateUserMiddleware implements NestMiddleware {

    constructor(private readonly authService: AuthService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const { jwt } = req.cookies;
        const authenticatedUser = await this.authService.getAuthorizedUser(jwt);

        req.body = {
            data: { ...req.body },
            authenticatedUser
        };

        next();
    }
}