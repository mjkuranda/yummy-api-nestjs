import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { UserDocument } from '../user/user.interface';

@Injectable()
export class AuthService {

    constructor(private readonly jwtManagerService: JwtManagerService,
                private readonly userService: UserService) {
    }

    public async getAuthorizedUser(jwtCookie: string): Promise<UserDocument> {
        if (!jwtCookie) {
            throw new BadRequestException('You are not authorized to execute this action. Please, log in first.', 'AuthService/getAuthorizedUser');
        }

        const userName = this.jwtManagerService.decodeUserData(jwtCookie);
        const user = await this.userService.getUser(userName);

        if (!user) {
            throw new NotFoundException('This user does not exist.', 'AuthService/getAuthorizedUser');
        }

        // TODO: doesn't have capability, so not authorized

        return user;
    }
}
