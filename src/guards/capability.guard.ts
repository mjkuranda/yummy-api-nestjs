import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CapabilityGuard implements CanActivate {

    constructor() {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const user = req.body.authenticatedUser;
        const capability = req.params['capability'];

        return user.isAdmin || Boolean(user.capabilities[capability]);
    }
}