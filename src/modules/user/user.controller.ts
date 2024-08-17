import { Body, Controller, HttpCode, Post, Response, Param, UseGuards, Request, Get, } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserDto, UserLoginDto } from './user.dto';
import { CapabilityType } from './user.types';
import { UserRepository } from '../../mongodb/repositories/user.repository';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { CapabilityGuard } from '../../guards/capability.guard';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService,
                private readonly userRepository: UserRepository) {}

    @Post('/login')
    @HttpCode(200)
    public async login(@Body() loginBody: UserLoginDto, @Response({ passthrough: true }) res) {
        return await this.userService.loginUser(loginBody, res);
    }

    @Post('/logout')
    @HttpCode(205)
    public async logout(@Request() req, @Response({ passthrough: true }) res) {
        const { accessToken, refreshToken } = req.cookies;
        const { login } = req.body;

        return await this.userService.logoutUser(res, login, accessToken, refreshToken);
    }

    @Post('/refreshTokens')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async refreshTokens(@Request() req, @Response({ passthrough: true }) res) {
        const { accessToken } = req.cookies;
        const { authenticatedUser } = req.body;

        return await this.userService.refreshTokens(authenticatedUser, accessToken, res);
    }

    @Post('/create')
    @HttpCode(201)
    public async register(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }

    @Post('/:login/grant/:capability')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CapabilityGuard)
    public async grantPermission(@Body() body, @Param('login') login: string, @Param('capability') capability: CapabilityType) {
        const forUser = await this.userRepository.findByLogin(login) as unknown as UserDto;
        const { authenticatedUser } = body;

        return await this.userService.grantPermission(forUser, authenticatedUser, capability);
    }

    @Post('/:login/deny/:capability')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CapabilityGuard)
    public async denyPermission(@Body() body, @Param('login') login: string, @Param('capability') capability: CapabilityType) {
        const forUser = await this.userRepository.findByLogin(login) as unknown as UserDto;
        const { authenticatedUser } = body;

        return await this.userService.denyPermission(forUser, authenticatedUser, capability);
    }

    @Post('/activate/:userActionId')
    @HttpCode(200)
    public async activate(@Param('userActionId') userActionId: string) {
        return await this.userService.activate(userActionId);
    }

    @Get('/not-activated')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, AdminGuard)
    public async getNotActivatedUsers() {
        return await this.userService.getNotActivated();
    }

    @Post('/:login/activate')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard, AdminGuard)
    public async activateViaLogin(@Param('login') login: string): Promise<void> {
        return await this.userService.activateViaLogin(login);
    }
}
