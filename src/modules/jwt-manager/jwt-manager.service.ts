import { Injectable } from '@nestjs/common';
import { UserAccessTokenPayload, UserRefreshTokenPayload } from '../auth/auth.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtManagerService {

    constructor(private readonly jwtService: JwtService) {}

    public async generateAccessToken(userDataPayload: UserAccessTokenPayload): Promise<string> {
        return await this.jwtService.signAsync(userDataPayload, { secret: process.env.ACCESS_TOKEN_SECRET });
    }

    public async generateRefreshToken(userDataPayload: UserRefreshTokenPayload): Promise<string> {
        return await this.jwtService.signAsync(userDataPayload, { secret: process.env.REFRESH_TOKEN_SECRET });
    }

    public async verifyAccessToken(accessToken: string): Promise<UserAccessTokenPayload> {
        return await this.jwtService.verifyAsync(accessToken, { secret: process.env.ACCESS_TOKEN_SECRET });
    }

    public async verifyRefreshToken(refreshToken: string): Promise<UserRefreshTokenPayload> {
        return await this.jwtService.verifyAsync(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET });
    }

    public async encodeUserData(userDataPayload: UserAccessTokenPayload): Promise<string> {
        return await this.jwtService.signAsync(userDataPayload, { secret: process.env.ACCESS_TOKEN_SECRET });
    }

    public decodeUserData(jwtCookie: string): UserAccessTokenPayload {
        return this.jwtService.decode(jwtCookie) as UserAccessTokenPayload;
    }
}
