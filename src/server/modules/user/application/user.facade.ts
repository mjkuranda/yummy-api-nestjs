import { Injectable } from '@nestjs/common';
import {
    ActivateUserByIdUseCase,
    ActivateUserUseCase,
    LoginUserUseCase,
    ChangePasswordUseCase,
    CreateUserUseCase,
    DenyPermissionUseCase,
    GetAllUsersUseCase,
    GetNotActivatedUsersUseCase,
    GetUserProfileUseCase, GrantPermissionUseCase, LogoutUserUseCase, RefreshTokensUseCase
} from './use-cases';
import { CreatedUserDto, CreateUserDto, GetUserProfileDto, GetUsersDto, UserLoginDto, UserTokensDto } from './dtos';
import { Response } from 'express';
import { UserAccessTokenPayload } from '../../jwt-manager/jwt-manager.types';
import { CapabilityType } from '../user.types';

@Injectable()
export class UserFacade {

    constructor(
        private readonly activateUserUseCase: ActivateUserUseCase,
        private readonly activateUserByIdUseCase: ActivateUserByIdUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly denyPermissionUseCase: DenyPermissionUseCase,
        private readonly getAllUsersUseCase: GetAllUsersUseCase,
        private readonly getNotActivatedUsersUseCase: GetNotActivatedUsersUseCase,
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly grantPermissionUseCase: GrantPermissionUseCase,
        private readonly loginUserUseCase: LoginUserUseCase,
        private readonly logoutUserUseCase: LogoutUserUseCase,
        private readonly refreshTokensUseCase: RefreshTokensUseCase
    ) {}

    /**
     * @description activates a new user
     * @param userActionId user action ID
     */
    async activate(userActionId: string): Promise<void> {
        return await this.activateUserUseCase.execute(userActionId);
    }

    /**
     * @description activates a new user using user ID
     * @param id user ID
     */
    async activateUserById(id: string): Promise<void> {
        return await this.activateUserByIdUseCase.execute(id);
    }

    /**
     * @description changes a user password
     * @param login user login
     * @param newPassword user new password
     */
    async changePassword(login: string, newPassword: string): Promise<void> {
        return await this.changePasswordUseCase.execute(login, newPassword);
    }

    /**
     * @description creates a new user
     * @param createUserDto data to create a new user
     * @returns new user entity
     */
    async createUser(createUserDto: CreateUserDto): Promise<CreatedUserDto> {
        return await this.createUserUseCase.execute(createUserDto);
    }

    /**
     * @description denies a permission for a specific user
     * @param authenticatedUser user data came from user token
     * @param targetLogin user login whom permission should be taken
     * @param capability which capability should be taken
     */
    async denyPermission(authenticatedUser: UserAccessTokenPayload, targetLogin: string, capability: CapabilityType): Promise<void> {
        return await this.denyPermissionUseCase.execute(authenticatedUser.login, targetLogin, capability);
    }

    /**
     * @description returns all users
     */
    async getAllUsers(): Promise<GetUsersDto> {
        return await this.getAllUsersUseCase.execute();
    }

    /**
     * @description returns all inactivated users
     */
    async getNotActivatedUsers(): Promise<GetUsersDto> {
        return await this.getNotActivatedUsersUseCase.execute();
    }

    /**
     * @description general user profile information along with dishes
     * @param login user login
     * @returns general user info and list of created dishes by a user
     */
    async getUserProfile(login: string): Promise<GetUserProfileDto> {
        return await this.getUserProfileUseCase.execute(login);
    }

    /**
     * @description grants a permission for a specific user
     * @param authenticatedUser user data came from user token
     * @param targetLogin user login whom permission should be given
     * @param capability which capability should be given
     */
    async grantPermission(authenticatedUser: UserAccessTokenPayload, targetLogin: string, capability: CapabilityType): Promise<void> {
        return await this.grantPermissionUseCase.execute(authenticatedUser.login, targetLogin, capability);
    }

    /**
     * @description log in a user into the system and returns its tokens
     * @param userLoginDto user login and password
     * @param res response object to set cookies
     */
    async login(userLoginDto: UserLoginDto, res: Response): Promise<UserTokensDto> {
        return await this.loginUserUseCase.execute(userLoginDto, res);
    }

    /**
     * @description log out the user from the system
     * @param res response object to unset cookies
     * @param login user login
     * @param accessToken user access token
     * @param refreshToken user refresh token
     */
    async logout(res: Response, login: string, accessToken: string, refreshToken: string): Promise<void> {
        return await this.logoutUserUseCase.execute(res, login, accessToken, refreshToken);
    }

    /**
     * @description refreshes user access token
     * @param authenticatedUser data about user
     * @param accessToken user access token
     * @param res response object to set new tokens
     */
    async refreshTokens(authenticatedUser: UserAccessTokenPayload, accessToken: string, res: Response): Promise<UserTokensDto> {
        return await this.refreshTokensUseCase.execute(authenticatedUser, accessToken, res);
    }
}