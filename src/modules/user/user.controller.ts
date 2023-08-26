import { Body, Controller, Post, Headers, Response } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserLoginDto } from './user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {QueryResult} from "../../common/interfaces";

const users = [
    {
        login: 'Test',
        password: '123' // 123
    },
    {
        login: 'Test2',
        password: '456' // 456
    }
];

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService,
                private readonly jwtService: JwtService) {}

    @Post('/login')
    public async login(
        @Body() loginBody: UserLoginDto,
        @Headers() headers,
        @Response({ passthrough: true }) res
    ): Promise<QueryResult<{ login: string; password: string; }>> {
        const user = users.find(user => user.login === loginBody.login);

        if (!user) {
            return {
                message: 'Incorrect credentials',
                statusCode: 400
            };
        }

        if (!await bcrypt.compare(loginBody.password, user.password)) {
            return {
                message: 'Incorrect credentials',
                statusCode: 400
            }
        }

        const jwt = await this.jwtService.signAsync(loginBody);

        res.cookie('jwt', jwt, { httpOnly: true });

        return {
            data: user,
            message: 'Successfully logged in',
            statusCode: 200
        }
    }

    @Post('/create')
    public async register(@Body() createUserDto: CreateUserDto) {
        const hashedPassword = await this.userService.getHashedPassword(createUserDto.password);

        await this.userService.createUser(createUserDto);

        users.push({
            login: createUserDto.login,
            password: hashedPassword
        });
    }
}
