import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { UserDocument } from '../user/user.interface';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {

    constructor(private readonly jwtManagerService: JwtManagerService,
                private readonly userService: UserService,
                private readonly loggerService: LoggerService) {
    }

    public async getAuthorizedUser(jwtCookie: string): Promise<UserDocument> {
        const context = 'AuthService/getAuthorizedUser';

        if (!jwtCookie) {
            const message = 'You are not authorized to execute this action. Please, log in first.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const userName = this.jwtManagerService.decodeUserData(jwtCookie);
        const user = await this.userService.getUser(userName);

        if (!user) {
            const message = 'This user does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        // TODO: doesn't have capability, so not authorized

        return user;
    }
}
