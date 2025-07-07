import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { UserFacade } from '../../application/user.facade';
import { ChangeUserPasswordDto, CreatedUserDto, CreateUserDto, GetUsersDto } from '../../application/dtos';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { AdminGuard } from '../../../../guards/admin.guard';
import { CapabilityGuard } from '../../../../guards/capability.guard';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { CapabilityType } from '../../domain/types';
import { User } from '../../../../decorators';

@Controller('users')
export class UserController {

    constructor(
        private readonly userFacade: UserFacade
    ) {}

    @Post()
    @HttpCode(201)
    public async createUser(
        @Body() createUserDto: CreateUserDto
    ): Promise<CreatedUserDto> {
        return await this.userFacade.createUser(createUserDto);
    }

    @Get()
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, AdminGuard)
    public async getAllUsers(): Promise<GetUsersDto> {
        return await this.userFacade.getAllUsers();
    }

    @Get('/not-activated')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, AdminGuard)
    public async getNotActivatedUsers(): Promise<GetUsersDto> {
        return await this.userFacade.getNotActivatedUsers();
    }

    @Patch('/password')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async changePassword(
        @User() user: UserAccessTokenPayload,
        @Body() body: ChangeUserPasswordDto
    ): Promise<void> {
        return await this.userFacade.changePassword(user.login, body.newPassword);
    }

    @Patch('/activate/:userActionId')
    @HttpCode(200)
    public async activate(
        @Param('userActionId') userActionId: string
    ): Promise<void> {
        return await this.userFacade.activate(userActionId);
    }

    @Patch('/:id/activate')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard, AdminGuard)
    public async activateViaId(
        @Param('id') id: string
    ): Promise<void> {
        return await this.userFacade.activateUserById(id);
    }

    @Put('/:login/capability/:capability')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CapabilityGuard)
    public async grantPermission(
        @Param('login') login: string,
        @Param('capability') capability: CapabilityType,
        @Body() body: UserAccessTokenPayload
    ): Promise<void> {
        return await this.userFacade.grantPermission(body, login, capability);
    }

    @Delete('/:login/capability/:capability')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CapabilityGuard)
    public async revokePermission(
        @Param('login') login: string,
        @Param('capability') capability: CapabilityType,
        @Body() body: UserAccessTokenPayload
    ): Promise<void> {
        return await this.userFacade.denyPermission(body, login, capability);
    }

}