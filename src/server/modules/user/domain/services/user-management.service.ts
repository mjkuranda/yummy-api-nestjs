import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { PasswordManagerService } from './password-manager.service';
import { MailManagerService } from '../../../mail-manager/mail-manager.service';
import { UserEntity } from '../entities';
import { UserAlreadyExistsError } from '../errors';
import { CreateUserVo } from '../vos';
import { UserDataManageable } from '../../../provider-registry/data-manageable.interface';

@Injectable()
export class UserManagementService {

    private readonly userApiService: UserDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly passwordManagerService: PasswordManagerService,
        private readonly mailManagerService: MailManagerService
    ) {
        this.userApiService = this.providerRegistryService.getUserApiService();
    }

    /**
     * @description creates a new user
     * @param login user login
     * @param email user email
     * @param password user password
     * @returns new user entity
     */
    async createUser(login: string, email: string, password: string): Promise<UserEntity> {
        const user = await this.userApiService.findUserByLogin(login);

        if (user) {
            throw new UserAlreadyExistsError(login);
        }

        const salt = await this.passwordManagerService.generateSalt();
        const hashedPassword = await this.passwordManagerService.getHashedPassword({
            password,
            salt,
            pepper: process.env.PASSWORD_PEPPER
        });

        const createUserVo = new CreateUserVo(login, email, hashedPassword);
        const savedUser = await this.userApiService.createNewUser(createUserVo);
        const userActionRecord = await this.userApiService.createAction(savedUser.getId(), 'activate');

        await this.mailManagerService.sendActivationMail(
            savedUser.getEmail(),
            savedUser.getLogin(),
            userActionRecord.getId()
        );

        return savedUser;
    }

    /**
     * @description returns all users
     */
    async getAllUsers(): Promise<UserEntity[]> {
        return await this.userApiService.getAllUsers();
    }

    /**
     * @description returns all inactivated users
     */
    async getNotActivatedUsers(): Promise<UserEntity[]> {
        return await this.userApiService.getAllNotActivatedUsers();
    }

    /**
     * @description changes a user password
     * @param login user login
     * @param password user new password
     */
    async changePassword(login: string, password: string): Promise<void> {
        const salt = await this.passwordManagerService.generateSalt();
        const hashedPassword = await this.passwordManagerService.getHashedPassword({
            password,
            salt,
            pepper: process.env.PASSWORD_PEPPER
        });

        await this.userApiService.changeUserPassword(login, hashedPassword, salt);
    }
}