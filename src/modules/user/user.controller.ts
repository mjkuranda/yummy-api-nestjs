import { Body, Controller, HttpCode, Post, Response } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserLoginDto } from './user.dto';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post('/login')
    @HttpCode(200)
    public async login(@Body() loginBody: UserLoginDto, @Response({ passthrough: true }) res) {
        return await this.userService.loginUser(loginBody, res);
    }

    @Post('/logout')
    @HttpCode(200)
    public async logout(@Response({ passthrough: true }) res) {
        return await this.userService.logoutUser(res);
    }

    @Post('/create')
    @HttpCode(201)
    public async register(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }
}
