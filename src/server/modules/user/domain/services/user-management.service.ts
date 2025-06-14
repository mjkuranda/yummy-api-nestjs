import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../provider/provider-registry.service';
import { UserActionRepository, UserRepository } from '../repositories';
import { PasswordManagerService } from '../../../password-manager/password-manager.service';
import { MailManagerService } from '../../../mail-manager/mail-manager.service';
import { UserEntity } from '../entities';
import { UserAlreadyExistsError } from '../../../../errors/domain';
import { CreateUserValueObject } from '../value-objects';

@Injectable()
export class UserManagementService {

    private readonly userRepository: UserRepository;
    private readonly userActionRepository: UserActionRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService,
        private readonly passwordManagerService: PasswordManagerService,
        private readonly mailManagerService: MailManagerService
    ) {
        this.userRepository = this.providerRegistryService.getUserRepository();
        this.userActionRepository = this.providerRegistryService.getUserActionRepository();
    }

    /**
     * @description creates a new user
     * @param login user login
     * @param email user email
     * @param password user password
     * @returns new user entity
     */
    async createUser(login: string, email: string, password: string): Promise<UserEntity> {
        const user = await this.userRepository.findByLogin(login);

        if (user) {
            throw new UserAlreadyExistsError(login);
        }

        const salt = await this.passwordManagerService.generateSalt();
        const hashedPassword = await this.passwordManagerService.getHashedPassword({
            password,
            salt,
            pepper: process.env.PASSWORD_PEPPER
        });

        const createUserVo = new CreateUserValueObject(login, email, hashedPassword);
        const savedUser = await this.userRepository.create(createUserVo);
        const userActionRecord = await this.userActionRepository.create(savedUser.getId(), 'activate');

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
        return await this.userRepository.getAll();
    }

    /**
     * @description returns all inactivated users
     */
    async getNotActivatedUsers(): Promise<UserEntity[]> {
        return await this.userRepository.getAllNotActivated();
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

        await this.userRepository.changePassword(login, hashedPassword, salt);
    }
}