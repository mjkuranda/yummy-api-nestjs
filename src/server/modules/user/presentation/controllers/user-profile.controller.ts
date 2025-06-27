import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { UserFacade } from '../../application/user.facade';
import { GetUserProfileDto } from '../../application/dtos';

@Controller('users/profiles')
export class UserProfileController {

    constructor(
        private readonly userFacade: UserFacade
    ) {}

    @Get('/:login/profile')
    @HttpCode(200)
    public async getUserProfile(
        @Param('login') login: string
    ): Promise<GetUserProfileDto> {
        return await this.userFacade.getUserProfile(login);
    }

}