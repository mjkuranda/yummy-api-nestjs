import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { UserDocument } from './user.interface';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { CreateUserDto, UserDto } from './user.dto';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { CapabilityType } from './user.types';
import { MailManagerService } from '../mail-manager/mail-manager.service';
import { UserActionDocument } from '../../schemas/user-action.document';
import * as mongoose from 'mongoose';
import { ForbiddenException } from '../../exceptions/forbidden-exception';
import { UserRepository } from '../../repositories/user.repository';

describe('UserService', () => {
    let userService: UserService;
    let userRepository: UserRepository;
    let userActionModel: Model<UserActionDocument>;
    let jwtManagerService: JwtManagerService;
    let mailManagerService: MailManagerService;

    const mockUser = {
        email: 'xxx',
        login: 'Aaa',
        password: 'hashed password',
        activated: 1
    } as any as UserDocument;

    const mockUserRepository = {
        findById: jest.fn(),
        findOne: jest.fn(),
        findByLogin: jest.fn(),
        create: jest.fn(),
        updateOne: jest.fn()
    };

    const mockUserActionModel = {
        create: jest.fn(),
        findById: jest.fn(),
        deleteOne: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository
                },
                {
                    provide: getModelToken(models.USER_ACTION_MODEL),
                    useValue: mockUserActionModel
                },
                {
                    provide: JwtService,
                    useClass: JwtService
                },
                {
                    provide: JwtManagerService,
                    useClass: JwtManagerService
                },
                {
                    provide: LoggerService,
                    useValue: {
                        info: () => {},
                        error: () => {}
                    }
                },
                {
                    provide: REDIS_CLIENT,
                    useValue: {}
                },
                {
                    provide: MailManagerService,
                    useValue: {
                        sendActivationMail: jest.fn().mockImplementation((email, id) => {})
                    }
                }
            ],
        }).compile();

        userService = module.get(UserService);
        userRepository = module.get(UserRepository);
        userActionModel = module.get(getModelToken(models.USER_ACTION_MODEL));
        jwtManagerService = module.get(JwtManagerService);
        mailManagerService = module.get(MailManagerService);
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
        expect(userRepository).toBeDefined();
        expect(jwtManagerService).toBeDefined();
    });

    describe('loginUser', () => {
        let mockUserDto;
        let mockRes;

        beforeAll(() => {
            mockUserDto = {
                email: 'xxx',
                login: 'Aaa',
                password: '123'
            };
            mockRes = {
                cookie: jest.fn()
            };
        });

        it('should log in user', async () => {
            const mockCookie = 'some.jwt.cookie';
            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(mockUser);
            jest.spyOn(userService, 'areSameHashedPasswords').mockResolvedValueOnce(true);
            jest.spyOn(jwtManagerService, 'encodeUserData').mockResolvedValueOnce(mockCookie);

            const result = await userService.loginUser(mockUserDto, mockRes);

            expect(result).toBe(mockUser);
        });

        it('should throw an error when user has not activated account', async () => {
            const mockCookie = 'some.jwt.cookie';
            const mockInactivatedUser = {
                email: 'xxx',
                login: 'Aaa',
                password: 'hashed password'
            } as any as UserDocument;

            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(mockInactivatedUser);
            jest.spyOn(userService, 'areSameHashedPasswords').mockResolvedValueOnce(true);
            jest.spyOn(jwtManagerService, 'encodeUserData').mockResolvedValueOnce(mockCookie);

            await expect(userService.loginUser(mockUserDto, mockRes)).rejects.toThrow(ForbiddenException);
        });

        it('should throw an error when user does not exist', async () => {
            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(null);

            await expect(userService.loginUser(mockUserDto, mockRes)).rejects.toThrow(NotFoundException);
        });

        it('should throw an error when user found but passwords do not match', async () => {
            mockUserDto = {
                ...mockUserDto,
                password: '456',
                activated: 1
            };

            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(mockUser);

            await expect(userService.loginUser(mockUserDto, mockRes)).rejects.toThrow(BadRequestException);
        });
    });

    describe('createUser', () => {
        const mockUserDto: CreateUserDto = {
            email: 'xxx',
            login: 'Login',
            password: '123'
        };

        it('should create a new user', async () => {
            const mockHashedPassword = 'hashed password';
            const mockCreatedUser = {
                _id: 'userId',
                email: mockUserDto.email,
                login: mockUserDto.login,
                password: mockHashedPassword,
            } as any;
            const mockUserAction = {
                _id: 'actionId',
                userId: 'userId',
                type: 'activate'
            } as any;

            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(null);
            jest.spyOn(userService, 'getHashedPassword').mockResolvedValueOnce(mockHashedPassword);
            jest.spyOn(userRepository, 'create').mockResolvedValue(mockCreatedUser);
            jest.spyOn(userActionModel, 'create').mockResolvedValueOnce(mockUserAction);

            const result = await userService.createUser(mockUserDto);

            expect(result).toBe(mockCreatedUser);
            expect(userActionModel.create).toBeCalled();
            expect(mailManagerService.sendActivationMail).toBeCalledWith(mockCreatedUser.email, mockUserAction._id);
        });

        it('should throw an error when the user exist', async () => {
            const mockExistingUser = {
                email: 'xxx',
                login: mockUserDto.login,
                password: 'some password'
            } as any;

            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(mockExistingUser);

            await expect(userService.createUser(mockUserDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('grantPermission', () => {
        let mockUser: UserDto;
        let mockAdminUser: UserDto;

        beforeAll(() => {
            mockUser = {
                _id: 'xxx-xxx',
                email: 'xxx',
                login: 'xxx',
                password: 'yyy'
            };
            mockAdminUser = {
                _id: 'yyy-yyy',
                email: 'yyy',
                login: 'admin',
                password: 'admin',
                isAdmin: true
            };
        });

        it('should grant a new permission to user by admin', async () => {
            const mockCapability: CapabilityType = 'canAdd';

            const result = await userService.grantPermission(mockUser, mockAdminUser, mockCapability);

            expect(result).toBe(true);
        });

        it('should not grant a new permission when user has already had it', async () => {
            const mockUserWithCapability: UserDto = {
                ...mockUser,
                capabilities: {
                    'canAdd': true,
                    'canEdit': false,
                    'canRemove': false
                }
            };

            const result = await userService.grantPermission(mockUserWithCapability, mockAdminUser, 'canAdd');

            expect(result).toBe(false);
        });

        it('should throw an error when user has not found', async () => {
            const mockUser = null;
            const capability = 'canAdd';

            await expect(userService.grantPermission(mockUser, mockAdminUser, capability)).rejects.toThrow(NotFoundException);
        });
    });

    describe('denyPermission', () => {
        let mockUser: UserDto;
        let mockAdminUser: UserDto;

        beforeAll(() => {
            mockUser = {
                _id: 'xxx-xxx',
                email: 'xxx',
                login: 'xxx',
                password: 'yyy',
                capabilities: {
                    canAdd: true,
                    canEdit: false,
                    canRemove: false
                }
            };
            mockAdminUser = {
                _id: 'yyy-yyy',
                email: 'yyy',
                login: 'admin',
                password: 'admin',
                isAdmin: true
            };
        });

        it('should deny new permission to user by admin', async () => {
            const mockCapability: CapabilityType = 'canAdd';

            const result = await userService.denyPermission(mockUser, mockAdminUser, mockCapability);

            expect(result).toBe(true);
        });

        it('should not deny permission when user has not already had it', async () => {
            const mockCapability: CapabilityType = 'canAdd';
            const mockUserWithNoCapability: UserDto = {
                _id: 'xxx',
                email: 'xxx',
                login: 'xxx',
                password: 'xxx'
            };

            const result = await userService.denyPermission(mockUserWithNoCapability, mockAdminUser, mockCapability);

            expect(result).toBe(false);
        });

        it('should throw an error when user has not found', async () => {
            const mockUser = null;
            const capability = 'canAdd';

            await expect(userService.denyPermission(mockUser, mockAdminUser, capability)).rejects.toThrow(NotFoundException);
        });
    });

    describe('activate', () => {
        it('should fail when activation token is invalid', async () => {
            const mockInvalidId = 'invalid id';

            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(false);

            await expect(userService.activate(mockInvalidId)).rejects.toThrow(BadRequestException);
        });

        it('should fail when action for token has not found', async () => {
            const mockValidId = 'some valid token';

            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(userActionModel, 'findById').mockReturnValueOnce(null);

            await expect(userService.activate(mockValidId)).rejects.toThrow(NotFoundException);
        });

        it('should fail when found action but user not found', async () => {
            const mockValidId = 'some valid token';
            const mockUserAction = {
                _id: mockValidId,
                userId: 'some user id',
                type: 'activate'
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(userActionModel, 'findById').mockReturnValueOnce(mockUserAction);
            jest.spyOn(userRepository, 'findById').mockReturnValueOnce(null);

            await expect(userService.activate(mockValidId)).rejects.toThrow(BadRequestException);
        });

        it('should fail when user is already activated', async () => {
            const mockValidId = 'some valid token';
            const mockUserAction = {
                _id: mockValidId,
                userId: 'some user id',
                type: 'activate'
            } as any;
            const mockUser = {
                _id: mockUserAction.userId,
                email: 'xxx',
                login: 'x',
                pass: 'hashed',
                activated: 1
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(userActionModel, 'findById').mockReturnValueOnce(mockUserAction);
            jest.spyOn(userRepository, 'findById').mockReturnValueOnce(mockUser);

            const result = await userService.activate(mockValidId);

            expect(result).toBeUndefined();
        });

        it('should activate a user', async () => {
            const mockValidId = 'some valid token';
            const mockUserAction = {
                _id: mockValidId,
                userId: 'some user id',
                type: 'activate'
            } as any;
            const mockUser = {
                _id: mockUserAction.userId,
                email: 'xxx',
                login: 'x',
                pass: 'hashed'
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(userActionModel, 'findById').mockReturnValueOnce(mockUserAction);
            jest.spyOn(userRepository, 'findById').mockReturnValueOnce(mockUser);

            const result = await userService.activate(mockValidId);

            expect(result).toBeUndefined();
        });
    });
});
