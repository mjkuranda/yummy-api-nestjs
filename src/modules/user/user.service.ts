import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserLoginDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { UserDocument } from './user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { LoggerService } from '../logger/logger.service';
import { NotFoundException } from '../../exceptions/not-found.exception';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(models.USER_MODEL)
        private userModel: Model<UserDocument>,
        private readonly jwtManagerService: JwtManagerService,
        private readonly loggerService: LoggerService
    ) {}

    async getUser(login: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ login });

        if (!user) {
            throw new NotFoundException('UserService/getUser', 'User does not found');
        }

        return user;
    }

    async loginUser(userLoginDto: UserLoginDto, res): Promise<UserDocument> {
        const { login, password } = userLoginDto;
        const context = 'UserService/loginUser';
        const user = await this.getUser(login);

        if (!user) {
            const message = `User ${login} does not exist`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        if (!await this.areSameHashedPasswords(password, user.password)) {
            const message = `Incorrect credentials for user ${login}`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const jwt = await this.jwtManagerService.encodeUserData({ login });
        res.cookie('jwt', jwt, { httpOnly: true });
        const message = `User "${login}" has been successfully logged in`;
        this.loggerService.info(context, message);

        return user;
    }

    async logoutUser(res): Promise<null> {
        res.clearCookie('jwt');

        return null;
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
        const context = 'UserService/createUser:';

        if (await this.getUser(createUserDto.login)) {
            const message = `User with "${createUserDto.login}" login has already exists`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const hashedPassword = await this.getHashedPassword(createUserDto.password);
        const newUser = await this.userModel.create({
            login: createUserDto.login,
            password: hashedPassword
        }) as UserDocument;
        const message = `Created user "${newUser.login}" with id "${newUser._id}"`;

        this.loggerService.info(context, message);

        return newUser;
    }

    async getHashedPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }

    async areSameHashedPasswords(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
