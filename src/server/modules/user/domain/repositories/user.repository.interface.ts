import { UserEntity } from '../entities';
import { CreateUserValueObject } from '../value-objects';

export interface UserRepository {
    findById(id: string): Promise<UserEntity | null>;
    findByLogin(login: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    create(createUserVo: CreateUserValueObject): Promise<UserEntity>;
    update(user: UserEntity): Promise<UserEntity>;
    delete(id: string): Promise<void>;
    getAll(): Promise<UserEntity[]>;
    getAllNotActivated(): Promise<UserEntity[]>;
    markAsActivated(id: string): Promise<void>;
    changePassword(login: string, password: string, salt: string): Promise<void>;
    grantPermission(user: UserEntity, capability: string): Promise<void>;
    denyPermission(user: UserEntity, capability: string): Promise<void>;
    deleteTokens(login: string, accessToken: string, refreshToken: string): Promise<void>;
    getRefreshToken(login: string): Promise<string | null>;
    setTokens(login: string, accessToken: string, refreshToken: string | null): Promise<void>;
}