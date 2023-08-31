import { Injectable } from '@nestjs/common';
import { AuthResult } from './auth.interface';
import { UserService } from '../user/user.service';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';

@Injectable()
export class AuthService {

    constructor(private readonly jwtManagerService: JwtManagerService,
                private readonly userService: UserService) {
    }

    public async getAnalysis(jwtCookie: string): Promise<AuthResult> {
        if (!jwtCookie) {
            return {
                message: 'You are not authorized to execute this action. Please, log in first.',
                statusCode: 400
            }
        }

        const userName = this.jwtManagerService.decodeUserData(jwtCookie);
        const user = await this.userService.getUser(userName);

        if (!user) {
            return {
                message: 'This user does not exist.',
                statusCode: 404
            }
        }

        // TODO: doesn't have capability, so not authorized

        return {
            user,
            message: 'You are authorized to execute this action.',
            statusCode: 200,
            isAuthenticated: true
        }
    }
}
