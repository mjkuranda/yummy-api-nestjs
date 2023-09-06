import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserLoginDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { QueryResult } from '../../common/interfaces';
import { UserDocument } from './user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(models.USER_MODEL)
        private userModel: Model<UserDocument>,
        private readonly jwtManagerService: JwtManagerService,
        private readonly loggerService: LoggerService
    ) {}

    async getUsers(): Promise<UserDocument[]> {
        return (await this.userModel.find()) as UserDocument[];
    }

    async getUser(login: string): Promise<UserDocument | null> {
        const users = await this.getUsers();

        return users.find(user => user.login === login);
    }

    async loginUser(userLoginDto: UserLoginDto, res): Promise<QueryResult<UserDocument>> {
        const { login, password } = userLoginDto;
        const context = 'UserService/loginUser';
        const user = await this.getUser(login);

        if (!user) {
            const message = 'User does not exist';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        if (!await bcrypt.compare(password, user.password)) {
            const message = 'Incorrect credentials';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const jwt = await this.jwtManagerService.encodeUserData({ login });
        res.cookie('jwt', jwt, { httpOnly: true });
        const message = `User "${login}" has been successfully logged in`;
        this.loggerService.info(context, message);

        return {
            data: user,
            message,
            statusCode: 200
        };
    }

    async logoutUser(res): Promise<QueryResult<UserDocument>> {
        res.clearCookie('jwt');

        return {
            message: 'You have been successfully logged out',
            statusCode: 200
        };
    }

    async createUser(createUserDto: CreateUserDto): Promise<QueryResult<UserDocument>> {
        const context = 'UserService/createUser:';

        if (await this.getUser(createUserDto.login)) {
            const message = `User with "${createUserDto.login}" login has already exists`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const hashedPassword = await this.getHashedPassword(createUserDto.password);
        const createdUser = new this.userModel({
            login: createUserDto.login,
            password: hashedPassword
        });
        const data = await createdUser.save() as UserDocument;
        const message = `Created user "${data.login}" with id "${data._id}"`;

        this.loggerService.info(context, message);

        return {
            data,
            message,
            statusCode: 201
        };
    }

    async getHashedPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }
}
