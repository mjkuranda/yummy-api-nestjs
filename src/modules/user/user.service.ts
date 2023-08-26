import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserLoginDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { QueryResult } from '../../common/interfaces';
import { UserDocument } from './user.interface';
import { JwtService } from '@nestjs/jwt';

const users = [];

@Injectable()
export class UserService {

    constructor(private readonly jwtService: JwtService) {}

    async getUsers(): Promise<UserDocument[]> {
        return Promise.resolve(users);
    }

    async getUser(login: string): Promise<UserDocument | null> {
        const users = await this.getUsers();

        return users.find(user => user.login === login);
    }

    async loginUser(userLoginDto: UserLoginDto, res): Promise<QueryResult<UserDocument>> {
        const { login, password } = userLoginDto;
        const user = await this.getUser(login);

        if (!user) {
            return {
                message: 'User does not exist',
                statusCode: 400
            };
        }

        if (!await bcrypt.compare(password, user.password)) {
            return {
                message: 'Incorrect credentials',
                statusCode: 400
            }
        }

        const jwt = await this.jwtService.signAsync(login);

        res.cookie('jwt', jwt, { httpOnly: true });

        return {
            data: user,
            message: 'Successfully logged in',
            statusCode: 200
        }
    }

    async createUser(createUserDto: CreateUserDto): Promise<QueryResult<UserDocument>> {
        const hashedPassword = await this.getHashedPassword(createUserDto.password);
        const user = {
            login: createUserDto.login,
            password: hashedPassword
        } as UserDocument;
        const message = `Created user "${user.login}"`;

        users.push(user);

        console.info('UserService/createUser:', message);

        return {
            data: user,
            message,
            statusCode: 201
        };
    }

    async getHashedPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }
}
