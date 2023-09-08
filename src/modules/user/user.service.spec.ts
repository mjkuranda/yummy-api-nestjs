import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { UserDocument } from './user.interface';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { CreateUserDto } from './user.dto';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';

describe('UserService', () => {
    let service: UserService;
    let model: Model<UserDocument>;
    let jwtManagerService: JwtManagerService;

    const mockUser = {
        login: 'Aaa',
        password: 'hashed password'
    } as UserDocument;

    const mockUserService = {
        findOne: jest.fn(),
        getUser: jest.fn(),
        areSameHashedPasswords: jest.fn(),
        create: jest.fn()
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
                }
            ],
        }).compile();

        service = module.get(UserService);
        model = module.get(getModelToken(models.USER_MODEL));
        jwtManagerService = module.get(JwtManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUser', () => {
        it('should return user', async () => {
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser);

            const result = await service.getUser(mockUser.login);

            expect(model.findOne).toHaveBeenCalledWith({ login: mockUser.login });
            expect(result).toBe(mockUser);
        });

        it('should throw an error when user not found', async () => {
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);

            const givenNonExistingLogin = 'Non existing user name';

            await expect(service.getUser(givenNonExistingLogin)).rejects.toThrow(NotFoundException);
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
            jest.spyOn(service, 'getUser').mockResolvedValueOnce(mockUser);
            jest.spyOn(service, 'areSameHashedPasswords').mockResolvedValueOnce(true);
            jest.spyOn(jwtManagerService, 'encodeUserData').mockResolvedValueOnce(mockCookie);

            const result = await service.loginUser(mockUserDto, mockRes);

            expect(result).toBe(mockUser);
        });

        it('should throw an error when user does not exist', async () => {
            jest.spyOn(service, 'getUser').mockResolvedValueOnce(null);

            await expect(service.loginUser(mockUserDto, mockRes)).rejects.toThrow(NotFoundException);
        });

        it('should throw an error when user found but passwords do not match', async () => {
            mockUserDto = {
                ...mockUserDto,
                password: '456'
            };

            jest.spyOn(service, 'getUser').mockResolvedValueOnce(mockUser);

            await expect(service.loginUser(mockUserDto, mockRes)).rejects.toThrow(BadRequestException);
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

            jest.spyOn(service, 'getUser').mockResolvedValueOnce(null);
            jest.spyOn(service, 'getHashedPassword').mockResolvedValueOnce(mockHashedPassword);
            jest.spyOn(model, 'create').mockResolvedValue(mockCreatedUser);

            const result = await service.createUser(mockUserDto);

            expect(result).toBe(mockCreatedUser);
        });

        it('should throw an error when the user exist', async () => {
            const mockExistingUser = {
                login: mockUserDto.login,
                password: 'some password'
            } as any;

            jest.spyOn(service, 'getUser').mockResolvedValueOnce(mockExistingUser);

            await expect(service.createUser(mockUserDto)).rejects.toThrow(BadRequestException);
        });
    });
});
