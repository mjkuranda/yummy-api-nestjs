import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../exceptions/unauthorized-exception';
import { JwtManagerService } from '../modules/jwt-manager/jwt-manager.service';
import { RedisService } from '../modules/redis/redis.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {

    constructor(private readonly jwtManagerService: JwtManagerService,
                private readonly redisService: RedisService) {}

    canActivate(executionContext: ExecutionContext): boolean {
        const req = executionContext.switchToHttp().getRequest();
        const token = req.headers['authorization']?.split(' ')[1];
        const context = 'AuthenticationGuard/canActivate';

        if (!token) {
            throw new UnauthorizedException(context, 'Not provided accessToken.');
        }

        const user = this.jwtManagerService.decodeUserData(token);
        const cachedToken = this.redisService.get(`user:${user.login}`);

        if (!cachedToken) {
            throw new UnauthorizedException(context, 'User accessToken expired.');
        }

        if (token !== cachedToken) {
            throw new UnauthorizedException(context, 'Tokens are not matched.');
        }

        return true;
    }
}