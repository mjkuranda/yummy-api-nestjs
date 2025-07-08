import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { JwtManagerService } from '../../../jwt-manager/jwt-manager.service';
import { PasswordManagerService } from './password-manager.service';
import { InactiveUserError, IncorrectUserCredentialsError, MismatchedUserTokensError, UserWithLoginNotFoundError, ExpiredRefreshTokenError } from '../errors';
import { UserTokensVo } from '../vos';
import { UserCacheService } from '../../../cache/domains/user/user-cache.service';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { UserDataManageable } from '../../../provider-registry/data-manageable.interface';

@Injectable()
export class AuthenticationService {

    private readonly userApiService: UserDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly jwtManagerService: JwtManagerService,
        private readonly userCacheService: UserCacheService,
        private readonly passwordManagerService: PasswordManagerService
    ) {
        this.userApiService = this.providerRegistryService.getUserApiService();
    }

    /**
     * @description log in a user to the system and returns tokens
     * @param login user login
     * @param password user password
     * @return user tokens
     */
    async login(login: string, password: string): Promise<UserTokensVo> {
        const user = await this.userApiService.findUserByLogin(login);

        if (!user) {
            throw new UserWithLoginNotFoundError(login);
        }

        if (!user.isActivated()) {
            throw new InactiveUserError(login);
        }

        const areTheSamePasswords = await this.passwordManagerService.areEqualPasswords({
            password,
            salt: user.getSalt(),
            pepper: process.env.PASSWORD_PEPPER
        }, user.getPassword());

        if (!areTheSamePasswords) {
            throw new IncorrectUserCredentialsError(login);
        }

        const accessToken = await this.jwtManagerService.generateAccessToken({
            login,
            isAdmin: user.isAdmin(),
            capabilities: user.getCapabilities().toObject()
        });
        const refreshToken = await this.jwtManagerService.generateRefreshToken({ login });

        await this.userCacheService.setUserToken(login, 'access', accessToken);
        await this.userCacheService.setUserToken(login, 'refresh', refreshToken);

        return new UserTokensVo(accessToken, refreshToken);
    }

    /**
     * @description log out the user from the system
     * @param login user login
     * @param accessToken user access token
     * @param refreshToken user refresh token
     */
    async logout(login: string, accessToken: string, refreshToken: string): Promise<void> {
        const cachedAccessToken = await this.userCacheService.getUserToken(login, 'access');
        const cachedRefreshToken = await this.userCacheService.getUserToken(login, 'refresh');

        if (cachedAccessToken === accessToken && cachedRefreshToken === refreshToken) {
            await this.userCacheService.unsetUserTokens(login);
        }

        throw new MismatchedUserTokensError(login);
    }

    /**
     * @description returns new user tokens
     * @param userPayload user data decoded from token
     * @param accessToken user access token
     * @returns new user tokens
     */
    async refreshTokens(userPayload: UserAccessTokenPayload, accessToken: string): Promise<UserTokensVo> {
        const cachedRefreshToken = await this.userCacheService.getUserToken(userPayload.login, 'refresh');

        if (!cachedRefreshToken) {
            throw new ExpiredRefreshTokenError(userPayload.login);
        }

        const cachedAccessToken = await this.userCacheService.getUserToken(userPayload.login, 'access');

        if (cachedAccessToken !== accessToken) {
            throw new MismatchedUserTokensError(userPayload.login);
        }

        const newAccessToken = await this.jwtManagerService.generateAccessToken(userPayload);

        const refreshTokenPayload = await this.jwtManagerService.verifyRefreshToken(cachedRefreshToken);
        let newRefreshToken = null;

        if (this.isTooShortToExpireRefreshToken(refreshTokenPayload)) {
            newRefreshToken = await this.jwtManagerService.generateRefreshToken(refreshTokenPayload);
        }

        await this.userCacheService.setUserToken(userPayload.login, 'access', newAccessToken);
        await this.userCacheService.setUserToken(userPayload.login, 'refresh', newRefreshToken);

        return new UserTokensVo(newAccessToken, newRefreshToken);
    }

    private isTooShortToExpireRefreshToken(payload: any): boolean {
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        const minimumTimeToExpiration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        return timeUntilExpiration < minimumTimeToExpiration;
    }
}