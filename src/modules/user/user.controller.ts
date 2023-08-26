import { Body, Controller, Post, Headers, Response } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserLoginDto } from './user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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
    ) {
        const user = users.find(user => user.login === loginBody.login);

        if (!user) {
            return '400 - credentials';
        }

        if (!await bcrypt.compare(loginBody.password, user.password)) {
            return '400 - credentials 2';
        }

        const jwt = await this.jwtService.signAsync(loginBody);

        res.cookie('jwt', jwt, { httpOnly: true });

        return {
            message: 'success'
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
