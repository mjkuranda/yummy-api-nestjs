import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CreationGuard implements CanActivate {

    constructor() {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const user = req.body.authenticatedUser;



        if (user.isAdmin) {
            return true;
        }

        if (user.capabilities?.canAdd) {
            return true;
        }

        return false;
    }
}