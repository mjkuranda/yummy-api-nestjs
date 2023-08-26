import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import {QueryResult} from "../../common/interfaces";
import {UserDocument} from "./user.interface";

const users = [];

@Injectable()
export class UserService {

    async getUsers(): Promise<UserDocument[]> {
        return Promise.resolve(users);
    }

    async loginUser(): Promise<QueryResult<UserDocument>> {

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
