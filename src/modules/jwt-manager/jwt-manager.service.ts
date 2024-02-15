import { Injectable } from '@nestjs/common';
import {
    UserAccessTokenPayload,
    UserAccessTokenPayloadDto,
    UserRefreshTokenPayload,
    UserRefreshTokenPayloadDto
} from './jwt-manager.types';
import { JwtService } from '@nestjs/jwt';
import { generateUserDataPayload } from './jwt-manager.utils';

@Injectable()
export class JwtManagerService {

    constructor(private readonly jwtService: JwtService) {}

    public async generateAccessToken(userDataPayloadDto: UserAccessTokenPayloadDto): Promise<string> {
        const userDataPayload = generateUserDataPayload(userDataPayloadDto);

        return await this.jwtService.signAsync(userDataPayload, { secret: process.env.ACCESS_TOKEN_SECRET });
    }

    public async generateRefreshToken(userDataPayloadDto: UserRefreshTokenPayloadDto): Promise<string> {
        const userDataPayload = generateUserDataPayload(userDataPayloadDto);

        return await this.jwtService.signAsync(userDataPayload, { secret: process.env.REFRESH_TOKEN_SECRET });
    }

    public async verifyAccessToken(accessToken: string): Promise<UserAccessTokenPayload> {
        return await this.jwtService.verifyAsync(accessToken, { secret: process.env.ACCESS_TOKEN_SECRET });
    }

    public async verifyRefreshToken(refreshToken: string): Promise<UserRefreshTokenPayload> {
        return await this.jwtService.verifyAsync(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET });
    }

    // TODO: Deprecated. Remove it
    public async encodeUserData(userDataPayload: UserAccessTokenPayload): Promise<string> {
        return await this.jwtService.signAsync(userDataPayload, { secret: process.env.ACCESS_TOKEN_SECRET });
    }

    // TODO: Deprecated. Remove it
    public decodeUserData(jwtCookie: string): UserAccessTokenPayload {
        return this.jwtService.decode(jwtCookie) as UserAccessTokenPayload;
    }
}
