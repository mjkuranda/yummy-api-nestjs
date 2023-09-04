import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class AuthorizeMiddleware implements NestMiddleware {

    constructor(private readonly authService: AuthService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const { jwt } = req.cookies;
        const authorizedUser = await this.authService.getAuthorizedUser(jwt);

        // Modify body
        req.body = {
            ...req.body,
            author: authorizedUser.login,
            posted: new Date().getTime()
        };

        next();
    }
}