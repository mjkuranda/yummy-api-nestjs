import { UserEntity } from '../entities';
import { CreateUserValueObject } from '../value-objects';
import { CapabilityType } from '../types';

export interface UserRepository {
    findUserById(id: string): Promise<UserEntity | null>;
    findUserByLogin(login: string): Promise<UserEntity | null>;
    findUserByEmail(email: string): Promise<UserEntity | null>;
    createNewUser(createUserVo: CreateUserValueObject): Promise<UserEntity>;
    updateUser(user: UserEntity): Promise<UserEntity>;
    deleteUser(id: string): Promise<void>;
    getAllUsers(): Promise<UserEntity[]>;
    getAllNotActivatedUsers(): Promise<UserEntity[]>;
    markAsActivatedUser(id: string): Promise<void>;
    changeUserPassword(login: string, password: string, salt: string): Promise<void>;
    grantPermissionForUser(user: UserEntity, capability: CapabilityType): Promise<void>;
    denyPermissionForUser(user: UserEntity, capability: CapabilityType): Promise<void>;
    deleteSessionTokens(login: string, accessToken: string, refreshToken: string): Promise<void>;
    getRefreshToken(login: string): Promise<string | null>;
    setSessionTokens(login: string, accessToken: string, refreshToken: string | null): Promise<void>;
}