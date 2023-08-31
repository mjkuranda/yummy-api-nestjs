import { Injectable } from '@nestjs/common';
import { UserDataPayload } from '../auth/auth.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtManagerService {

    constructor(private readonly jwtService: JwtService) {}

    public async encodeUserData(userDataPayload: UserDataPayload): Promise<string> {
        const { login } = userDataPayload;

        return await this.jwtService.signAsync(login, { secret: process.env.ACCESS_TOKEN_SECRET })
    }

    public decodeUserData(jwtCookie: string): string {
        return this.jwtService.decode(jwtCookie) as string;
    }
}
