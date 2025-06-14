import { Body, Controller, HttpCode, Post, Response, Param, UseGuards, Request, Get } from '@nestjs/common';
import { CreateUserDto, UserLoginDto, UserNewPasswordDto } from './user.dto';
import { CapabilityType } from './user.types';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { CapabilityGuard } from '../../guards/capability.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { TransformedBody } from '../../common/interfaces';
import { UserFacade } from './application/user.facade';
import { CreatedUserDto, GetUserProfileDto, GetUsersDto, UserTokensDto } from './application/dtos';
import { UserAccessTokenPayload } from '../jwt-manager/jwt-manager.types';

@Controller('users')
export class UserController {

    constructor(
        private readonly userFacade: UserFacade
    ) {}

    @Get()
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, AdminGuard)
    public async allUsers(): Promise<GetUsersDto> {
        return await this.userFacade.getAllUsers();
    }

    @Post('/login')
    @HttpCode(200)
    public async login(
        @Body() loginBody: UserLoginDto,
        @Response({ passthrough: true }) res
    ): Promise<UserTokensDto> {
        return await this.userFacade.login(loginBody, res);
    }

    @Post('/logout')
    @HttpCode(205)
    public async logout(
        @Request() req,
        @Response({ passthrough: true }) res
    ): Promise<void> {
        const { accessToken, refreshToken } = req.cookies;
        const { login } = req.body;

        return await this.userFacade.logout(res, login, accessToken, refreshToken);
    }

    @Post('/refreshTokens')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async refreshTokens(
        @Request() req,
        @Response({ passthrough: true }) res
    ): Promise<UserTokensDto> {
        const { accessToken } = req.cookies;
        const { authenticatedUser } = req.body;

        return await this.userFacade.refreshTokens(authenticatedUser, accessToken, res);
    }

    @Post('/create')
    @HttpCode(201)
    public async register(
        @Body() createUserDto: CreateUserDto
    ): Promise<CreatedUserDto> {
        return await this.userFacade.createUser(createUserDto);
    }

    @Post('/:login/grant/:capability')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CapabilityGuard)
    public async grantPermission(
        @Body() body: TransformedBody<UserAccessTokenPayload>,
        @Param('login') login: string,
        @Param('capability') capability: CapabilityType
    ): Promise<void> {
        const { authenticatedUser } = body;

        return await this.userFacade.grantPermission(authenticatedUser, login, capability);
    }

    @Post('/:login/deny/:capability')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CapabilityGuard)
    public async denyPermission(
        @Body() body: TransformedBody<UserAccessTokenPayload>,
        @Param('login') login: string,
        @Param('capability') capability: CapabilityType
    ): Promise<void> {
        const { authenticatedUser } = body;

        return await this.userFacade.denyPermission(authenticatedUser, login, capability);
    }

    @Post('/activate/:userActionId')
    @HttpCode(200)
    public async activate(
        @Param('userActionId') userActionId: string
    ): Promise<void> {
        return await this.userFacade.activate(userActionId);
    }

    @Get('/not-activated')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, AdminGuard)
    public async getNotActivatedUsers(): Promise<GetUsersDto> {
        return await this.userFacade.getNotActivatedUsers();
    }

    @Post('/:id/activate')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard, AdminGuard)
    public async activateViaId(
        @Param('id') id: string
    ): Promise<void> {
        return await this.userFacade.activateUserById(id);
    }

    @Post('/change-password')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async changePassword(
        @Body() body: TransformedBody<UserNewPasswordDto>
    ): Promise<void> {
        const { authenticatedUser, data } = body;

        return await this.userFacade.changePassword(authenticatedUser.login, data.newPassword);
    }

    @Get('/:login/profile')
    @HttpCode(200)
    public async getUserProfile(
        @Param('login') login: string
    ): Promise<GetUserProfileDto> {
        return await this.userFacade.getUserProfile(login);
    }
}
