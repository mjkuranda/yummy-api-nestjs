import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto, UserDto, UserLoginDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { UserDocument } from './user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { LoggerService } from '../logger/logger.service';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { Redis } from 'ioredis';
import { CapabilityType } from './user.types';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(models.USER_MODEL) private userModel: Model<UserDocument>,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
        private readonly jwtManagerService: JwtManagerService,
        private readonly loggerService: LoggerService
    ) {}

    async getUser(login: string): Promise<UserDocument> {
        return this.userModel.findOne({ login });
    }

    async loginUser(userLoginDto: UserLoginDto, res): Promise<UserDocument> {
        const { login, password } = userLoginDto;
        const context = 'UserService/loginUser';
        const user = await this.getUser(login);

        if (!user) {
            const message = `User ${login} does not exist`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        if (!await this.areSameHashedPasswords(password, user.password)) {
            const message = `Incorrect credentials for user ${login}`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const jwt = await this.jwtManagerService.encodeUserData({ login });
        res.cookie('jwt', jwt, { httpOnly: true });
        const message = `User "${login}" has been successfully logged in`;
        this.loggerService.info(context, message);

        return user;
    }

    async logoutUser(res): Promise<null> {
        res.clearCookie('jwt');

        return null;
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
        const context = 'UserService/createUser';

        if (await this.getUser(createUserDto.login)) {
            const message = `User with "${createUserDto.login}" login has already exists`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const hashedPassword = await this.getHashedPassword(createUserDto.password);
        const newUser = await this.userModel.create({
            login: createUserDto.login,
            password: hashedPassword
        }) as UserDocument;
        const message = `Created user "${newUser.login}" with id "${newUser._id}"`;

        this.loggerService.info(context, message);

        return newUser;
    }

    async getHashedPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }

    async areSameHashedPasswords(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    async grantPermission(user: UserDto, byUser: UserDto, capability: CapabilityType): Promise<boolean> {
        const context = 'UserService/grantPermission';

        if (!user) {
            const message = 'Failed action to grant a permission. User with provided login does not exist.';
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        if (user.capabilities && user.capabilities[capability]) {
            this.loggerService.info(context, `User "${user.login}" has provided capability.`);

            return false;
        }

        await this.userModel.updateOne(
            {
                _id: user._id,
                login: user.login
            },
            {
                $set: {
                    capabilities: {
                        ...user.capabilities,
                        [capability]: true
                    }
                }
            }
        );
        this.loggerService.info(context, `User "${byUser.login}" has granted permission "${capability}" to "${user.login}" user.`);

        return true;
    }

    async denyPermission(user: UserDto, byUser: UserDto, capability: CapabilityType): Promise<boolean> {
        const context = 'UserService/denyPermission';

        if (!user) {
            const message = 'Failed action to deny a permission. User with provided login does not exist.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        if (!user.capabilities || !user.capabilities[capability]) {
            this.loggerService.info(context, `User "${user.login}" has not provided capability.`);

            return false;
        }

        const newCapabilities = user.capabilities;
        delete newCapabilities[capability];

        await this.userModel.updateOne(
            {
                _id: user._id,
                login: user.login
            },
            {
                $set: {
                    capabilities: newCapabilities
                }
            }
        );
        this.loggerService.info(context, `User "${byUser.login}" has denied permission "${capability}" to "${user.login}" user.`);

        return true;
    }
}
