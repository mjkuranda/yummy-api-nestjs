import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class AuthorizeMiddleware implements NestMiddleware {

    constructor(private readonly authService: AuthService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const { jwt } = req.cookies;

        const authorizationResult = await this.authService.getAnalysis(jwt);

        if (!authorizationResult.isAuthenticated) {
            const { message, statusCode } = authorizationResult;
            console.error('AuthorizeMiddleware/use:', message);

            return {
                message,
                statusCode
            };
        }

        // Modify body
        req.body = {
            ...req.body,
            author: authorizationResult.user.login,
            postedTime: new Date().getTime()
        };

        next();
    }
}