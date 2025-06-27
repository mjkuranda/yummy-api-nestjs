import { Body, Controller, HttpCode, Post, Request, Response, UseGuards } from '@nestjs/common';
import { UserFacade } from '../../application/user.facade';
import { UserLoginDto, UserTokensDto } from '../../application/dtos';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';

@Controller('user-auth')
export class UserAuthController {

    constructor(
        private readonly userFacade: UserFacade
    ) {}

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

}