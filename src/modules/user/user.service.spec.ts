import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserDocument } from '../../mongodb/documents/user.document';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { CreateUserDto, UserDto } from './user.dto';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { CapabilityType, UserObject } from './user.types';
import { MailManagerService } from '../mail-manager/mail-manager.service';
import mongoose from 'mongoose';
import { ForbiddenException } from '../../exceptions/forbidden-exception';
import { UserRepository } from '../../mongodb/repositories/user.repository';
import { UserActionRepository } from '../../mongodb/repositories/user.action.repository';
import { RedisService } from '../redis/redis.service';
import { UserAccessTokenPayload, UserRefreshTokenPayload } from '../jwt-manager/jwt-manager.types';
import { PasswordManagerService } from '../password-manager/password-manager.service';

describe('UserService', () => {
    let userService: UserService;
    let userRepository: UserRepository;
    let userActionRepository: UserActionRepository;
    let jwtManagerService: JwtManagerService;
    let mailManagerService: MailManagerService;
    let redisService: RedisService;
    let passwordManagerService: PasswordManagerService;

    const mockUser = {
        email: 'xxx',
        login: 'Aaa',
        password: 'hashed password',
        capabilities: {
            canAdd: true
        },
        activated: 1
    } as any as UserDocument;

    const mockUserRepository = {
        findById: jest.fn(),
        findOne: jest.fn(),
        findByLogin: jest.fn(),
        create: jest.fn(),
        updateOne: jest.fn(),
        getAll: jest.fn()
    };

    const mockUserActionRepository = {
        findById: jest.fn(),
        findOne: jest.fn(),
        findByLogin: jest.fn(),
        create: jest.fn(),
        deleteOne: jest.fn()
    };

    const mockJwtManagerService = {
        generateAccessToken: jest.fn(),
        verifyAccessToken: jest.fn(),
        generateRefreshToken: jest.fn(),
        verifyRefreshToken: jest.fn()
    };

    const mockRedisService = {
        set: jest.fn(),
        get: jest.fn(),
        del: jest.fn(),
        setTokens: jest.fn(),
        unsetTokens: jest.fn(),
        getAccessToken: jest.fn(),
        getRefreshToken: jest.fn()
    };

    const mockPasswordManagerService = {
        areEqualPasswords: jest.fn(),
        getHashedPassword: jest.fn(),
        generateSalt: jest.fn()
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
                    provide: UserActionRepository,
                    useValue: mockUserActionRepository
                },
                {
                    provide: JwtService,
                    useClass: JwtService
                },
                {
                    provide: JwtManagerService,
                    useValue: mockJwtManagerService
                },
                {
                    provide: LoggerService,
                    useValue: {
                        info: () => {},
                        error: () => {}
                    }
                },
                {
                    provide: RedisService,
                    useValue: mockRedisService
                },
                {
                    provide: MailManagerService,
                    useValue: {
                        sendActivationMail: jest.fn()
                    }
                },
                {
                    provide: PasswordManagerService,
                    useValue: mockPasswordManagerService
                }
            ],
        }).compile();

        userService = module.get(UserService);
        userRepository = module.get(UserRepository);
        userActionRepository = module.get(UserActionRepository);
        jwtManagerService = module.get(JwtManagerService);
        mailManagerService = module.get(MailManagerService);
        redisService = module.get(RedisService);
        passwordManagerService = module.get(PasswordManagerService);
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
        expect(userRepository).toBeDefined();
        expect(jwtManagerService).toBeDefined();
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const mockUsers: UserObject[] = [
                { id: 'abc123', email: 'x@q.com', login: 'x', isAdmin: true, capabilities: { canAdd: true }},
                { id: 'cba321', email: 'y@q.com', login: 'y', capabilities: { canDelete: true }}
            ];

            jest.spyOn(userRepository, 'getAll').mockReturnValueOnce(Promise.resolve(mockUsers));

            const result = await userService.getAllUsers();

            expect(result).toHaveLength(2);
        });
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
            const accessToken = 'token1';
            const refreshToken = 'token2';
            const mockedPermissions = {
                capabilities: {
                    canAdd: true
                }
            };

            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(mockUser);
            jest.spyOn(passwordManagerService, 'areEqualPasswords').mockResolvedValueOnce(true);
            jest.spyOn(jwtManagerService, 'generateAccessToken').mockResolvedValue(accessToken);
            jest.spyOn(jwtManagerService, 'generateRefreshToken').mockResolvedValue(refreshToken);
            jest.spyOn(redisService, 'set').mockResolvedValue();

            const result = await userService.loginUser(mockUserDto, mockRes);

            expect(result).toStrictEqual(mockedPermissions);
        });

        it('should throw an error when user has not activated account', async () => {
            const mockInactivatedUser = {
                email: 'xxx',
                login: 'Aaa',
                password: 'hashed password'
            } as any as UserDocument;

            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(mockInactivatedUser);
            jest.spyOn(passwordManagerService, 'areEqualPasswords').mockResolvedValueOnce(true);

            await expect(userService.loginUser(mockUserDto, mockRes)).rejects.toThrow(ForbiddenException);
        });

        it('should throw an error when user does not exist', async () => {
            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(null);

            await expect(userService.loginUser(mockUserDto, mockRes)).rejects.toThrow(NotFoundException);
        });

        it('should throw an error when user found but passwords do not match', async () => {
            jest.resetAllMocks();
            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(mockUser);
            jest.spyOn(passwordManagerService, 'areEqualPasswords').mockResolvedValueOnce(false);

            await expect(userService.loginUser(mockUserDto, mockRes)).rejects.toThrow(BadRequestException);
        });
    });

    describe('logoutUser', () => {
        it('should clear tokens and successfully logout', async () => {
            // Given
            const mockRes = {
                clearCookie: jest.fn()
            } as any;
            const mockLogin = 'login';
            const mockAccessToken = 'token1';
            const mockRefreshToken = 'token2';

            // When
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue(mockAccessToken);

            const result = await userService.logoutUser(mockRes, mockLogin, mockAccessToken, mockRefreshToken);

            // Then
            expect(result).toBeUndefined();
        });
    });

    describe('refreshTokens', () => {
        it('should refresh accessToken when refreshToken is valid', async () => {
            const mockAccessToken = 'token';
            const mockResponse: any = {
                cookie: jest.fn()
            };
            const mockAccessTokenPayload: UserAccessTokenPayload = {
                login: 'some login',
                expirationTimestamp: Date.now() + 10000000
            };
            const mockRefreshToken = 'token2';
            const mockNewAccessToken = 'new token';
            const mockRefreshTokenPayload: UserRefreshTokenPayload = {
                login: 'some login',
                expirationTimestamp: Date.now() + 100000000
            };

            jest.clearAllMocks();
            jest.spyOn(redisService, 'getRefreshToken').mockResolvedValueOnce(mockRefreshToken);
            jest.spyOn(jwtManagerService, 'generateAccessToken').mockResolvedValueOnce(mockNewAccessToken);
            jest.spyOn(jwtManagerService, 'verifyRefreshToken').mockResolvedValueOnce(mockRefreshTokenPayload);

            const result = await userService.refreshTokens(mockAccessTokenPayload, mockAccessToken, mockResponse);

            expect(result).toBeUndefined();
            expect(jwtManagerService.generateRefreshToken).not.toHaveBeenCalled();
            expect(redisService.setTokens).toHaveBeenCalledWith(mockAccessTokenPayload.login, mockNewAccessToken, null);
            expect(mockResponse.cookie).toHaveBeenCalledWith('accessToken', mockNewAccessToken, { httpOnly: true, sameSite: 'none', secure: true });
            expect(mockResponse.cookie).not.toHaveBeenCalledWith('refreshToken');
        });

        it('should throw an error when refreshToken expired', async () => {
            const mockAccessToken = 'token';
            const mockResponse: any = {
                cookie: jest.fn()
            };
            const mockAccessTokenPayload: UserAccessTokenPayload = {
                login: 'some login',
                expirationTimestamp: Date.now() + 10000000
            };
            const mockRefreshToken = null;

            jest.clearAllMocks();
            jest.spyOn(redisService, 'getRefreshToken').mockResolvedValueOnce(mockRefreshToken);

            await expect(userService.refreshTokens(mockAccessTokenPayload, mockAccessToken, mockResponse)).rejects.toThrow(ForbiddenException);
        });

        it('should refresh the both tokens when refresh token is going to expire', async () => {
            const mockAccessToken = 'token';
            const mockResponse: any = {
                cookie: jest.fn()
            };
            const mockAccessTokenPayload: UserAccessTokenPayload = {
                login: 'some login',
                expirationTimestamp: Date.now() + 10000000
            };
            const mockRefreshToken = 'token2';
            const mockNewAccessToken = 'new token';
            const mockRefreshTokenPayload: UserRefreshTokenPayload = {
                login: 'some login',
                expirationTimestamp: Date.now() + 30
            };
            const mockNewRefreshToken = 'new token2';

            jest.clearAllMocks();
            jest.spyOn(redisService, 'getRefreshToken').mockResolvedValueOnce(mockRefreshToken);
            jest.spyOn(jwtManagerService, 'generateAccessToken').mockResolvedValueOnce(mockNewAccessToken);
            jest.spyOn(jwtManagerService, 'verifyRefreshToken').mockResolvedValueOnce(mockRefreshTokenPayload);
            jest.spyOn(jwtManagerService, 'generateRefreshToken').mockResolvedValueOnce(mockNewRefreshToken);

            const result = await userService.refreshTokens(mockAccessTokenPayload, mockAccessToken, mockResponse);

            expect(result).toBeUndefined();
            expect(redisService.setTokens).toHaveBeenCalledWith(mockAccessTokenPayload.login, mockNewAccessToken, mockNewRefreshToken);
            expect(mockResponse.cookie).toHaveBeenCalledWith('accessToken', mockNewAccessToken, { httpOnly: true, sameSite: 'none', secure: true });
            expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', mockNewRefreshToken, { httpOnly: true, sameSite: 'none', secure: true });
        });
    });

    describe('createUser', () => {
        const mockUserDto: CreateUserDto = {
            email: 'xxx',
            login: 'Login',
            password: '123',
            salt: 'salt'
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
            jest.spyOn(passwordManagerService, 'getHashedPassword').mockResolvedValueOnce(mockHashedPassword);
            jest.spyOn(userRepository, 'create').mockResolvedValue(mockCreatedUser);
            jest.spyOn(userActionRepository, 'create').mockResolvedValueOnce(mockUserAction);

            const result = await userService.createUser(mockUserDto);

            expect(result).toBe(mockCreatedUser);
            expect(userActionRepository.create).toBeCalled();
            expect(mailManagerService.sendActivationMail).toBeCalledWith(mockCreatedUser.email, mockCreatedUser.login, mockUserAction._id);
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
                    'canDelete': false
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
                    canDelete: false
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
            jest.spyOn(userActionRepository, 'findById').mockReturnValueOnce(null);

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
            jest.spyOn(userActionRepository, 'findById').mockReturnValueOnce(mockUserAction);
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
            jest.spyOn(userActionRepository, 'findById').mockReturnValueOnce(mockUserAction);
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
            jest.spyOn(userActionRepository, 'findById').mockReturnValueOnce(mockUserAction);
            jest.spyOn(userRepository, 'findById').mockReturnValueOnce(mockUser);

            const result = await userService.activate(mockValidId);

            expect(result).toBeUndefined();
        });
    });

    describe('activateViaId', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
        });

        it('should fail when action for token has not found', async () => {
            const mockUserId= 'some-user-id';

            jest.spyOn(userActionRepository, 'findOne').mockReturnValueOnce(null);

            await expect(userService.activateViaId(mockUserId)).rejects.toThrow(NotFoundException);
        });

        it('should fail when found action but user not found', async () => {
            const mockUserId = 'some-user-id';
            const mockUserAction = {
                _id: 'some-user-action-id',
                userId: mockUserId,
                type: 'activate'
            } as any;

            jest.spyOn(userActionRepository, 'findOne').mockReturnValueOnce(mockUserAction);
            jest.spyOn(userRepository, 'findById').mockReturnValueOnce(null);

            await expect(userService.activateViaId(mockUserId)).rejects.toThrow(BadRequestException);
        });

        it('should fail when user is already activated', async () => {
            const mockUserId = 'some-user-id';
            const mockUserAction = {
                _id: 'some-user-action-id',
                userId: mockUserId,
                type: 'activate'
            } as any;
            const mockUser = {
                _id: mockUserAction.userId,
                email: 'xxx',
                login: mockUserId,
                pass: 'hashed',
                activated: 1
            } as any;

            jest.spyOn(userActionRepository, 'findOne').mockReturnValueOnce(mockUserAction);
            jest.spyOn(userRepository, 'findById').mockReturnValueOnce(mockUser);

            const result = await userService.activateViaId(mockUserId);

            expect(result).toBeUndefined();
        });

        it('should activate a user', async () => {
            const mockUserId = 'some-user-id';
            const mockUserAction = {
                _id: 'some-user-action-id',
                userId: mockUserId,
                type: 'activate'
            } as any;
            const mockUser = {
                _id: mockUserAction.userId,
                email: 'xxx',
                login: mockUserId,
                pass: 'hashed',
            } as any;

            jest.spyOn(userActionRepository, 'findOne').mockReturnValueOnce(mockUserAction);
            jest.spyOn(userRepository, 'findById').mockReturnValueOnce(mockUser);

            const result = await userService.activateViaId(mockUserId);

            expect(result).toBeUndefined();
        });
    });
});
