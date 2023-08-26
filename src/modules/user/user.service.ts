import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserLoginDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { QueryResult } from '../../common/interfaces';
import { UserDocument } from './user.interface';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(models.USER_MODEL)
        private userModel: Model<UserDocument>,
        private readonly jwtService: JwtService) {}

    async getUsers(): Promise<UserDocument[]> {
        return (await this.userModel.find()) as UserDocument[];
    }

    async getUser(login: string): Promise<UserDocument | null> {
        const users = await this.getUsers();

        return users.find(user => user.login === login);
    }

    async loginUser(userLoginDto: UserLoginDto, res): Promise<QueryResult<UserDocument>> {
        const { login, password } = userLoginDto;
        const user = await this.getUser(login);

        if (!user) {
            const message = 'User does not exist';
            console.error('UserService/loginUser:', message);

            return {
                message,
                statusCode: 400
            };
        }

        if (!await bcrypt.compare(password, user.password)) {
            const message = 'Incorrect credentials';
            console.error('UserService/loginUser:', message);
            
            return {
                message,
                statusCode: 400
            }
        }

        const jwt = await this.jwtService.signAsync(login, { secret: process.env.ACCESS_TOKEN_SECRET });
        res.cookie('jwt', jwt, { httpOnly: true });
        const message = `User "${login}" has been successfully logged in`;

        console.info('UserService/loginUser:', message);

        return {
            data: user,
            message,
            statusCode: 200
        }
    }

    async createUser(createUserDto: CreateUserDto): Promise<QueryResult<UserDocument>> {
        if (await this.getUser(createUserDto.login)) {
            const message = `User with "${createUserDto.login}" login has already exists`;
            console.error('UserService/createUser:', message);

            return {
                message,
                statusCode: 400
            }
        }

        const hashedPassword = await this.getHashedPassword(createUserDto.password);
        const createdUser = new this.userModel({
            login: createUserDto.login,
            password: hashedPassword
        });
        const data = await createdUser.save() as UserDocument;
        const message = `Created user "${data.login}" with id "${data._id}"`;

        console.info('UserService/createUser:', message);

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
