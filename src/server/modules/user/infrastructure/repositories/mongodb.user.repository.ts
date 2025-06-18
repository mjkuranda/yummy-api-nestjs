import { UserRepository } from '../../domain/repositories';
import { isValidObjectId, Model } from 'mongoose';
import { UserDocument } from '../../../../../infrastructure/databases/mongodb/documents';
import { UserEntity } from '../../domain/entities';
import { userModel } from '../../../../common/definitions/mongoose-model.definitions';
import { InjectModel } from '@nestjs/mongoose';
import { InvalidMongooseObjectIdError } from '../../../../errors/infrastructure';
import { CreateUserValueObject } from '../../domain/value-objects';
import { UserCapabilitiesValueObject } from '../../domain/value-objects';
import { UserCacheService } from '../../../cache/user/user-cache.service';

export class MongodbUserRepository implements UserRepository {

    constructor(
        @InjectModel(userModel.name) private readonly model: Model<UserDocument>,
        private readonly userCacheService: UserCacheService
    ) {}

    async findById(id: string): Promise<UserEntity | null> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        const doc = await this.model.findById(id);
        if (!doc) {
            return null;
        }

        return this.toEntity(doc);
    }

    async findByLogin(login: string): Promise<UserEntity | null> {
        const doc = await this.model.findOne({ login });

        if (!doc) {
            return null;
        }

        return this.toEntity(doc);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const doc = await this.model.findOne({ email });

        if (!doc) {
            return null;
        }

        return this.toEntity(doc);
    }

    async create(createUserVo: CreateUserValueObject): Promise<UserEntity> {
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

    async update(user: UserEntity): Promise<UserEntity> {
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

    async delete(id: string): Promise<void> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        await this.model.deleteOne({ _id: id });
    }

    async getAll(): Promise<UserEntity[]> {
        const docs = await this.model.find();

        return docs.map(doc => this.toEntity(doc));
    }

    async getAllNotActivated(): Promise<UserEntity[]> {
        const docs = await this.model.find({ activated: -1 });

        return docs.map(doc => this.toEntity(doc));
    }

    async markAsActivated(id: string): Promise<void> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        await this.model.updateOne(
            { _id: id },
            { activated: Date.now() }
        );
    }

    async changePassword(login: string, password: string, salt: string): Promise<void> {
        await this.model.updateOne(
            { login },
            { password, salt }
        );
    }

    async grantPermission(user: UserEntity, capability: string): Promise<void> {
        if (!user.getId()) {
            throw new Error('Cannot update user without ID');
        }

        const updatedUser = user.grantCapability(capability);
        await this.update(updatedUser);
    }

    async denyPermission(user: UserEntity, capability: string): Promise<void> {
        if (!user.getId()) {
            throw new Error('Cannot update user without ID');
        }

        const updatedUser = user.denyCapability(capability);
        await this.update(updatedUser);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteTokens(login: string, accessToken: string, refreshToken: string): Promise<void> {
        // Delete both tokens from Redis
        await this.userCacheService.setUserToken(login, 'access', null);
        await this.userCacheService.setUserToken(login, 'access', null);
    }

    async getRefreshToken(login: string): Promise<string | null> {
        return await this.userCacheService.getUserToken(login, 'refresh');
    }

    async setTokens(login: string, accessToken: string, refreshToken: string | null): Promise<void> {
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
            UserCapabilitiesValueObject.fromObject(doc.capabilities || {})
        );
    }
}
