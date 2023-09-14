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

describe('UserService', () => {
    let userService: UserService;
    let userModel: Model<UserDocument>;
    let jwtManagerService: JwtManagerService;

    const mockUser = {
        login: 'Aaa',
        password: 'hashed password'
    } as UserDocument;

    const mockUserService = {
        findOne: jest.fn(),
        getUser: jest.fn(),
        areSameHashedPasswords: jest.fn(),
        create: jest.fn(),
        updateOne: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(models.USER_MODEL),
                    useValue: mockUserService
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
                }
            ],
        }).compile();

        userService = module.get(UserService);
        userModel = module.get(getModelToken(models.USER_MODEL));
        jwtManagerService = module.get(JwtManagerService);
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
        expect(userModel).toBeDefined();
        expect(jwtManagerService).toBeDefined();
    });

    describe('getUser', () => {
        it('should return user', async () => {
            jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser);

            const result = await userService.getUser(mockUser.login);

            expect(userModel.findOne).toHaveBeenCalledWith({ login: mockUser.login });
            expect(result).toBe(mockUser);
        });

        it('should return null value when user not found', async () => {
            const mockUserResult = null;
            const givenNonExistingLogin = 'Non existing user name';
            jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUserResult);

            const result = await userService.getUser(givenNonExistingLogin);

            expect(result).toBe(mockUserResult);
        });
    });

    describe('loginUser', () => {
        let mockUserDto;
        let mockRes;

        beforeAll(() => {
            mockUserDto = {
                login: 'Aaa',
                password: '123'
            };
            mockRes = {
                cookie: jest.fn()
            };
        });

        it('should log in user', async () => {
            const mockCookie = 'some.jwt.cookie';
            jest.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser);
            jest.spyOn(userService, 'areSameHashedPasswords').mockResolvedValueOnce(true);
            jest.spyOn(jwtManagerService, 'encodeUserData').mockResolvedValueOnce(mockCookie);

            const result = await userService.loginUser(mockUserDto, mockRes);

            expect(result).toBe(mockUser);
        });

        it('should throw an error when user does not exist', async () => {
            jest.spyOn(userService, 'getUser').mockResolvedValueOnce(null);

            await expect(userService.loginUser(mockUserDto, mockRes)).rejects.toThrow(NotFoundException);
        });

        it('should throw an error when user found but passwords do not match', async () => {
            mockUserDto = {
                ...mockUserDto,
                password: '456'
            };

            jest.spyOn(userService, 'getUser').mockResolvedValueOnce(mockUser);

            await expect(userService.loginUser(mockUserDto, mockRes)).rejects.toThrow(BadRequestException);
        });
    });

    describe('createUser', () => {
        const mockUserDto: CreateUserDto = {
            login: 'Login',
            password: '123'
        };

        it('should create a new user', async () => {
            const mockHashedPassword = 'hashed password';
            const mockCreatedUser = {
                login: mockUserDto.login,
                password: mockHashedPassword,
            } as any;

            jest.spyOn(userService, 'getUser').mockResolvedValueOnce(null);
            jest.spyOn(userService, 'getHashedPassword').mockResolvedValueOnce(mockHashedPassword);
            jest.spyOn(userModel, 'create').mockResolvedValue(mockCreatedUser);

            const result = await userService.createUser(mockUserDto);

            expect(result).toBe(mockCreatedUser);
        });

        it('should throw an error when the user exist', async () => {
            const mockExistingUser = {
                login: mockUserDto.login,
                password: 'some password'
            } as any;

            jest.spyOn(userService, 'getUser').mockResolvedValueOnce(mockExistingUser);

            await expect(userService.createUser(mockUserDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('grantPermission', () => {
        let mockUser: UserDto;
        let mockAdminUser: UserDto;

        beforeAll(() => {
            mockUser = {
                _id: 'xxx-xxx',
                login: 'xxx',
                password: 'yyy'
            };
            mockAdminUser = {
                _id: 'yyy-yyy',
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
            const mockCapability: CapabilityType = 'canAdd';
            const mockUserWithCapability: UserDto = {
                ...mockUser,
                capabilities: {
                    [mockCapability]: true
                }
            };

            const result = await userService.grantPermission(mockUserWithCapability, mockAdminUser, mockCapability);

            expect(result).toBe(false);
        });
    });

    describe('denyPermission', () => {
        let mockUser: UserDto;
        let mockAdminUser: UserDto;

        beforeAll(() => {
            mockUser = {
                _id: 'xxx-xxx',
                login: 'xxx',
                password: 'yyy',
                capabilities: {
                    canAdd: true
                }
            };
            mockAdminUser = {
                _id: 'yyy-yyy',
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
                login: 'xxx',
                password: 'xxx'
            };

            const result = await userService.denyPermission(mockUserWithNoCapability, mockAdminUser, mockCapability);

            expect(result).toBe(false);
        });
    });
});
