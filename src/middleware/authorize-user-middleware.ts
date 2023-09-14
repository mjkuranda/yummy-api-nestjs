import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '../exceptions/forbidden-exception';

@Injectable()
export class AuthorizeUserMiddleware implements NestMiddleware {

    async use(req: Request, res: Response, next: NextFunction) {
        const { authenticatedUser } = req.body;

        if (!authenticatedUser.isAdmin) {
            throw new ForbiddenException('AuthorizeUserMiddleware/use', `User "${authenticatedUser.login}" is not authorized to execute this action.`);
        }

        next();
    }
}