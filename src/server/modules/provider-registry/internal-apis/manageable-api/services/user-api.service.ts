import { Inject, Injectable } from '@nestjs/common';
import { UserDataManageable } from '../../../data-manageable.interface';
import { UserSearchQueryRepository } from '../../../../dish/domain/common/repositories';
import { UserActionRepository, UserRepository } from '../../../../user/domain/repositories';
import { REPOSITORIES_TOKEN } from '../../../../../constants/nestjs.contant';
import { RepositoryMap } from '../../../../../common/types';
import { Repository } from '../../../../../common/enums';
import { UserSearchQueryEntity } from '../../../../dish/domain/common/entities';
import { UserActionType } from '../../../../../../infrastructure/databases/mongodb/documents';
import { UserActionEntity, UserEntity } from '../../../../user/domain/entities';
import { CreateUserValueObject } from '../../../../user/domain/value-objects';
import { CapabilityType } from '../../../../user/user.types';

@Injectable()
export class UserApiService implements UserDataManageable {

    private readonly userRepository: UserRepository;
    private readonly userActionRepository: UserActionRepository;
    private readonly userSearchQueryRepository: UserSearchQueryRepository;

    constructor(
        @Inject(REPOSITORIES_TOKEN)
        private readonly repositoryMap: RepositoryMap
    ) {
        this.userRepository = this.repositoryMap[Repository.USER_REPOSITORY];
        this.userActionRepository = this.repositoryMap[Repository.USER_ACTION_REPOSITORY];
        this.userSearchQueryRepository = this.repositoryMap[Repository.USER_SEARCH_QUERY_REPOSITORY];
    }

    async findAllRecentQueries(userLogin: string): Promise<UserSearchQueryEntity[]> {
        return await this.userSearchQueryRepository.findAllRecentQueries(userLogin);
    }

    async insertNewQuery(userLogin: string, ingredients: string[]): Promise<void> {
        return await this.userSearchQueryRepository.insertNewQuery(userLogin, ingredients);
    }

    async changeUserPassword(login: string, password: string, salt: string): Promise<void> {
        return await this.userRepository.changeUserPassword(login, password, salt);
    }

    async createAction(userId: string, type: UserActionType): Promise<UserActionEntity> {
        return await this.userActionRepository.createAction(userId, type);
    }

    async createNewUser(createUserVo: CreateUserValueObject): Promise<UserEntity> {
        return await this.userRepository.createNewUser(createUserVo);
    }

    async deleteAction(id: string): Promise<void> {
        return await this.userActionRepository.deleteAction(id);
    }

    async deleteSessionTokens(login: string, accessToken: string, refreshToken: string): Promise<void> {
        return await this.userRepository.deleteSessionTokens(login, accessToken, refreshToken);
    }

    async deleteUser(id: string): Promise<void> {
        return await this.userRepository.deleteUser(id);
    }

    async denyPermissionForUser(user: UserEntity, capability: CapabilityType): Promise<void> {
        return await this.userRepository.denyPermissionForUser(user, capability);
    }

    async findActionById(id: string): Promise<UserActionEntity | null> {
        return await this.userActionRepository.findActionById(id);
    }

    async findActionByUserId(userId: string): Promise<UserActionEntity | null> {
        return await this.userActionRepository.findActionByUserId(userId);
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        return await this.userRepository.findUserByEmail(email);
    }

    async findUserById(id: string): Promise<UserEntity | null> {
        return await this.userRepository.findUserById(id);
    }

    async findUserByLogin(login: string): Promise<UserEntity | null> {
        return await this.userRepository.findUserByLogin(login);
    }

    async getAllNotActivatedUsers(): Promise<UserEntity[]> {
        return await this.userRepository.getAllNotActivatedUsers();
    }

    async getAllUsers(): Promise<UserEntity[]> {
        return await this.userRepository.getAllUsers();
    }

    async getRefreshToken(login: string): Promise<string | null> {
        return await this.userRepository.getRefreshToken(login);
    }

    async grantPermissionForUser(user: UserEntity, capability: CapabilityType): Promise<void> {
        return await this.userRepository.grantPermissionForUser(user, capability);
    }

    async markAsActivatedUser(id: string): Promise<void> {
        return await this.userRepository.markAsActivatedUser(id);
    }

    async setSessionTokens(login: string, accessToken: string, refreshToken: string | null): Promise<void> {
        return await this.userRepository.setSessionTokens(login, accessToken, refreshToken);
    }

    async updateUser(user: UserEntity): Promise<UserEntity> {
        return await this.userRepository.updateUser(user);
    }

}