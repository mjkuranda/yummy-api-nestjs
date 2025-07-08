import { UserRepository } from '../../domain/repositories';
import { isValidObjectId, Model } from 'mongoose';
import { UserDocument } from '../../../../../infrastructure/databases/mongodb/documents';
import { UserEntity } from '../../domain/entities';
import { userModel } from '../../../../common/definitions/mongoose-model.definitions';
import { InjectModel } from '@nestjs/mongoose';
import { InvalidMongooseObjectIdError } from '../../../../common/errors';
import { CreateUserVo } from '../../domain/vos';
import { UserCapabilitiesVo } from '../../domain/vos';
import { UserCacheService } from '../../../cache/domains/user/user-cache.service';

export class MongodbUserRepository implements UserRepository {

    constructor(
        @InjectModel(userModel.name) private readonly model: Model<UserDocument>,
        private readonly userCacheService: UserCacheService
    ) {}

    async findUserById(id: string): Promise<UserEntity | null> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        const doc = await this.model.findById(id);
        if (!doc) {
            return null;
        }

        return this.toEntity(doc);
    }

    async findUserByLogin(login: string): Promise<UserEntity | null> {
        const doc = await this.model.findOne({ login });

        if (!doc) {
            return null;
        }

        return this.toEntity(doc);
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        const doc = await this.model.findOne({ email });

        if (!doc) {
            return null;
        }

        return this.toEntity(doc);
    }

    async createNewUser(createUserVo: CreateUserVo): Promise<UserEntity> {
        const doc = await this.model.create({
            login: createUserVo.login,
            email: createUserVo.email,
            password: createUserVo.hashedPassword,
            salt: '', // Salt is handled by the service layer
            activated: -1,
            isAdmin: false,
            capabilities: {}
        });

        return this.toEntity(doc);
    }

    async updateUser(user: UserEntity): Promise<UserEntity> {
        if (!user.getId()) {
            throw new Error('Cannot update user without ID');
        }

        const doc = await this.model.findByIdAndUpdate(
            user.getId(),
            {
                login: user.getLogin(),
                email: user.getEmail(),
                password: user.getPassword(),
                salt: user.getSalt(),
                activated: user.getActivationTime(),
                isAdmin: user.isAdmin(),
                capabilities: user.getCapabilities().toObject()
            },
            { new: true }
        );

        if (!doc) {
            throw new Error('User not found');
        }

        return this.toEntity(doc);
    }

    async deleteUser(id: string): Promise<void> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        await this.model.deleteOne({ _id: id });
    }

    async getAllUsers(): Promise<UserEntity[]> {
        const docs = await this.model.find();

        return docs.map(doc => this.toEntity(doc));
    }

    async getAllNotActivatedUsers(): Promise<UserEntity[]> {
        const docs = await this.model.find({ activated: -1 });

        return docs.map(doc => this.toEntity(doc));
    }

    async markAsActivatedUser(id: string): Promise<void> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        await this.model.updateOne(
            { _id: id },
            { activated: Date.now() }
        );
    }

    async changeUserPassword(login: string, password: string, salt: string): Promise<void> {
        await this.model.updateOne(
            { login },
            { password, salt }
        );
    }

    async grantPermissionForUser(user: UserEntity, capability: string): Promise<void> {
        if (!user.getId()) {
            throw new Error('Cannot update user without ID');
        }

        const updatedUser = user.grantCapability(capability);
        await this.updateUser(updatedUser);
    }

    async denyPermissionForUser(user: UserEntity, capability: string): Promise<void> {
        if (!user.getId()) {
            throw new Error('Cannot update user without ID');
        }

        const updatedUser = user.denyCapability(capability);
        await this.updateUser(updatedUser);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteSessionTokens(login: string, accessToken: string, refreshToken: string): Promise<void> {
        // Delete both tokens from Redis
        await this.userCacheService.setUserToken(login, 'access', null);
        await this.userCacheService.setUserToken(login, 'access', null);
    }

    async getRefreshToken(login: string): Promise<string | null> {
        return await this.userCacheService.getUserToken(login, 'refresh');
    }

    async setSessionTokens(login: string, accessToken: string, refreshToken: string | null): Promise<void> {
        await this.userCacheService.setUserToken(login, 'access', accessToken);
        await this.userCacheService.setUserToken(login, 'refresh', refreshToken);
    }

    private toEntity(doc: UserDocument): UserEntity {
        return new UserEntity(
            doc._id,
            doc.login,
            doc.email,
            doc.password,
            doc.salt,
            doc.activated,
            doc.isAdmin,
            UserCapabilitiesVo.fromObject(doc.capabilities || {})
        );
    }
}
