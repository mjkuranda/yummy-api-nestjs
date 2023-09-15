import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '../exceptions/forbidden-exception';

@Injectable()
export class AuthorizeUserActionMiddleware implements NestMiddleware {

    async use(req: Request, res: Response, next: NextFunction) {
        const { authenticatedUser } = req.body;
        const [,,,action] = req.path;
        const hasCapability = (action) => {
            if (!authenticatedUser.capabilities) {
                return false;
            }

            if (action === 'create' && !authenticatedUser.capabilities.canAdd) {
                return false;
            }

            if (action === 'edit' && !authenticatedUser.capabilities.canEdit) {
                return false;
            }

            if (action === 'delete' && !authenticatedUser.capabilities.canRemove) {
                return false;
            }

            return true;
        };

        if (!authenticatedUser.isAdmin && !hasCapability(action)) {
            throw new ForbiddenException('AuthorizeUserMiddleware/use', `User "${authenticatedUser.login}" is not authorized to execute this action.`);
        }

        next();
    }
}