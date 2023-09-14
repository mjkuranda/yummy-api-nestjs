import { Body, Controller, HttpCode, Post, Response, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserDto, UserLoginDto } from './user.dto';
import { CapabilityType } from './user.types';

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

    @Post('/:login/grant/:capability')
    @HttpCode(200)
    public async grantPermission(@Body() body, @Param('login') login: string, @Param('capability') capability: CapabilityType) {
        const forUser = await this.userService.getUser(login) as UserDto;
        const { authenticatedUser } = body;

        return await this.userService.grantPermission(forUser, authenticatedUser, capability);
    }

    @Post('/:login/deny/:capability')
    @HttpCode(200)
    public async denyPermission(@Body() body, @Param('login') login: string, @Param('capability') capability: CapabilityType) {
        const forUser = await this.userService.getUser(login) as UserDto;
        const { authenticatedUser } = body;

        return await this.userService.denyPermission(forUser, authenticatedUser, capability);
    }
}
