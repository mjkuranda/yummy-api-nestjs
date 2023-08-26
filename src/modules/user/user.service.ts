import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

    async createUser(createUserDto: CreateUserDto) {
        return Promise.resolve();
    }

    async getHashedPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }
}
