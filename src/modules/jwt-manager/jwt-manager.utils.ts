import {
    UserAccessTokenPayload,
    UserAccessTokenPayloadDto,
    UserRefreshTokenPayload,
    UserRefreshTokenPayloadDto
} from './jwt-manager.types';
import { ACCESS_TOKEN_DURATION, REFRESH_TOKEN_DURATION } from '../../constants/tokens.constant';
import { MINUTE } from '../../constants/times.constant';

export function generateUserDataPayload<
    T extends UserAccessTokenPayloadDto | UserRefreshTokenPayloadDto,
    R = T extends UserAccessTokenPayloadDto ? UserAccessTokenPayload : UserRefreshTokenPayload
>(userData: T): R {
    const expirationTime = userData['capabilities'] ? ACCESS_TOKEN_DURATION : REFRESH_TOKEN_DURATION;

    return {
        ...userData,
        expirationTimestamp: Date.now() + expirationTime
    } as R;
}

export function isTooShortToExpireRefreshToken(userRefreshTokenPayload: UserRefreshTokenPayload): boolean {
    const toExpire = Date.now() - userRefreshTokenPayload.expirationTimestamp;

    return toExpire < MINUTE;
}