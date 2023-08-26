import { Body, Controller, Post, Response } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserLoginDto } from './user.dto';
import { QueryResult } from '../../common/interfaces';
import { UserDocument } from './user.interface';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post('/login')
    public async login(@Body() loginBody: UserLoginDto, @Response({ passthrough: true }) res): Promise<QueryResult<UserDocument>> {
        return await this.userService.loginUser(loginBody, res);
    }

    @Post('/create')
    public async register(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }
}
