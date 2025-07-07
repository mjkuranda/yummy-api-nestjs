import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtManagerService } from '../../../jwt-manager/jwt-manager.service';
import { UserCacheService } from '../../../cache/domains/user/user-cache.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {

    constructor(
        private readonly jwtManagerService: JwtManagerService,
        private readonly userCacheService: UserCacheService
    ) {}

    async canActivate(executionContext: ExecutionContext): Promise<boolean> {
        const req = executionContext.switchToHttp().getRequest();
        const token = req.headers['authorization']?.split(' ')[1] ?? req.cookies.accessToken;

        if (!token) {
            return true;
        }

        const user = await this.jwtManagerService.verifyAccessToken(token);
        const cachedToken = await this.userCacheService.getUserToken(user.login, 'access');

        if (!cachedToken) {
            return true;
        }

        if (token !== cachedToken) {
            return true;
        }

        req.body = user;

        return true;
    }
}