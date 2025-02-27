import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../exceptions/unauthorized-exception';
import { JwtManagerService } from '../modules/jwt-manager/jwt-manager.service';
import { RedisService } from '../modules/redis/redis.service';
import { AuthenticatedUserRequestBody } from '../modules/user/user.types';

@Injectable()
export class AuthenticationGuard implements CanActivate {

    constructor(private readonly jwtManagerService: JwtManagerService,
                private readonly redisService: RedisService) {}

    async canActivate(executionContext: ExecutionContext): Promise<boolean> {
        const req = executionContext.switchToHttp().getRequest();
        const token = req.headers['authorization']?.split(' ')[1] ?? req.cookies.accessToken;
        const context = 'AuthenticationGuard/canActivate';

        if (!token) {
            throw new UnauthorizedException(context, 'Not provided accessToken.');
        }

        const user = await this.jwtManagerService.verifyAccessToken(token);
        const cachedToken = await this.redisService.getAccessToken(user.login);

        if (!cachedToken) {
            throw new UnauthorizedException(context, 'User accessToken expired.');
        }

        if (token !== cachedToken) {
            throw new UnauthorizedException(context, 'Tokens are not matched.');
        }

        req.body = {
            data: {
                ...req.body
            },
            authenticatedUser: user
        } as AuthenticatedUserRequestBody<unknown>;

        return true;
    }
}