import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class EditionGuard implements CanActivate {

    constructor() {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const user = req.body.authenticatedUser;

        if (user.isAdmin) {
            return true;
        }

        if (user.capabilities?.canEdit) {
            return true;
        }

        return false;
    }
}