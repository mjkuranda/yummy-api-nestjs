import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResult } from './auth.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService,
                private readonly userService: UserService) {
    }

    decode(jwtCookie: string): AuthResult {
        if (!jwtCookie) {
            return {
                message: 'You are not authorized to execute this action. Please, log in first.',
                statusCode: 400
            }
        }

        const userName = this.decodeUserData(jwtCookie);
        const user = this.userService.getUser(userName);

        if (!user) {
            return {
                message: 'This user does not exist.',
                statusCode: 404
            }
        }

        // TODO: doesn't have capability, so not authorized

        return {
            message: 'You are authorized to execute this action.',
            statusCode: 200,
            isAuthenticated: true
        }
    }

    private decodeUserData(jwtCookie: string): string {
        return this.jwtService.decode(jwtCookie) as string;
    }
}
