import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto, UserDto, UserLoginDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { UserDocument } from './user.document';
import { isValidObjectId } from 'mongoose';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { LoggerService } from '../logger/logger.service';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { Redis } from 'ioredis';
import { CapabilityType } from './user.types';
import { MailManagerService } from '../mail-manager/mail-manager.service';
import { UserActionDocument } from '../../schemas/user-action.document';
import { ForbiddenException } from '../../exceptions/forbidden-exception';
import { UserRepository } from '../../repositories/user.repository';
import { UserActionRepository } from '../../repositories/user.action.repository';

@Injectable()
export class UserService {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly userActionRepository: UserActionRepository,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
        private readonly jwtManagerService: JwtManagerService,
        private readonly loggerService: LoggerService,
        private readonly mailManagerService: MailManagerService
    ) {}

    async loginUser(userLoginDto: UserLoginDto, res): Promise<UserDocument> {
        const { login, password } = userLoginDto;
        const context = 'UserService/loginUser';
        const user = await this.userRepository.findByLogin(login);

        if (!user) {
            const message = `User ${login} does not exist`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        if (!user.activated) {
            const message = `User "${user.login}" is not a valid account. You need to activate its first.`;
            this.loggerService.error(context, message);

            throw new ForbiddenException(context, message);
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

        if (await this.userRepository.findByLogin(createUserDto.login)) {
            const message = `User with "${createUserDto.login}" login has already exists`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const hashedPassword = await this.getHashedPassword(createUserDto.password);
        const newUser = await this.userRepository.create({
            email: createUserDto.email,
            login: createUserDto.login,
            password: hashedPassword
        }) as UserDocument;
        const userActionRecord = await this.userActionRepository.create({
            userId: newUser._id,
            type: 'activate'
        }) as UserActionDocument;
        await this.mailManagerService.sendActivationMail(newUser.email, userActionRecord._id);
        const message = `Created user "${newUser.login}" with id "${newUser._id}". To activate its, use: "${userActionRecord._id}" activation code.`;
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

        await this.userRepository.updateOne(
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

            throw new NotFoundException(context, message);
        }

        if (!user.capabilities || !user.capabilities[capability]) {
            this.loggerService.info(context, `User "${user.login}" has not provided capability.`);

            return false;
        }

        const newCapabilities = user.capabilities;
        delete newCapabilities[capability];

        await this.userRepository.updateOne(
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

    async activate(userActionId: string): Promise<void> {
        const context = 'UserService/activate';

        if (!isValidObjectId(userActionId)) {
            const message = 'Invalid activation token.';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const userAction = await this.userActionRepository.findById(userActionId) as UserActionDocument;

        if (!userAction) {
            const message = `Not found any request with "${userActionId}" activation token.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        const user = await this.userRepository.findById(userAction.userId) as UserDocument;

        if (!user) {
            const message = `User with id "${userAction.userId}" does not exist, reported by "${userActionId}" request token for activation.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        if (user.activated) {
            const message = `User "${user._id}" has already activated.`;
            this.loggerService.info(context, message);
            await this.userActionRepository.deleteOne({ _id: userActionId });

            return;
        }

        await this.userActionRepository.deleteOne({ _id: userActionId });
        await this.userRepository.updateOne({ _id: user._id }, {
            $set: {
                activated: new Date().getTime()
            }
        });
        this.loggerService.info(context, `User "${user._id}" has been successfully activated!`);
    }
}
