import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../src/modules/user/user.service';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from '../src/modules/logger/logger.service';
import { MailManagerService } from '../src/modules/mail-manager/mail-manager.service';
import { UserRepository } from '../src/mongodb/repositories/user.repository';
import { RedisService } from '../src/modules/redis/redis.service';
import { UserAccessTokenPayload, UserRefreshTokenPayload } from '../src/modules/jwt-manager/jwt-manager.types';
import { PasswordManagerService } from '../src/modules/password-manager/password-manager.service';
import { UserActionRepository } from '../src/mongodb/repositories/user.action.repository';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let userRepository: UserRepository;
    let userActionRepository: UserActionRepository;
    let jwtManagerService: JwtManagerService;
    let redisService: RedisService;
    let passwordManagerService: PasswordManagerService;

    const getCookie = (res, cookieName) => {
        const cookies = {};

        res.headers['set-cookie'].forEach((cookieHeader) => {
            const cookie = cookieHeader.split('; ')[0];
            const [key, value] = cookie.split('=');

            cookies[key] = value;
        });

        return cookies[cookieName] !== ''
            ? cookies[cookieName]
            : undefined;
    };
    const mockUserModelProvider = {
        create: () => {},
        updateOne: () => {},
        find: () => {},
        findById: () => {},
        findByLogin: () => {}
    };

    const mockUserActionRepositoryProvider = {
        create: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        deleteOne: jest.fn(),
        updateOne: jest.fn()
    };

    const mockJwtServiceProvider = {
        generateAccessToken: jest.fn(),
        generateRefreshToken: jest.fn(),
        verifyAccessToken: jest.fn(),
        verifyRefreshToken: jest.fn()
    };

    const mockRedisServiceProvider = {
        set: jest.fn().mockImplementation((x, y, z, v) => {}),
        get: jest.fn().mockImplementation((x) => x),
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
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LoggerService).useValue({ info: () => {}, error: () => {} })
            .overrideProvider(UserRepository).useValue(mockUserModelProvider)
            .overrideProvider(UserActionRepository).useValue(mockUserActionRepositoryProvider)
            .overrideProvider(MailManagerService).useValue({ sendActivationMail: jest.fn((email, id) => {}) })
            .overrideProvider(JwtManagerService).useValue(mockJwtServiceProvider)
            .overrideProvider(RedisService).useValue(mockRedisServiceProvider)
            .overrideProvider(PasswordManagerService).useValue(mockPasswordManagerService)
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        userService = moduleRef.get(UserService);
        userRepository = moduleRef.get(UserRepository);
        userActionRepository = moduleRef.get(UserActionRepository);
        jwtManagerService = moduleRef.get(JwtManagerService);
        redisService = moduleRef.get(RedisService);
        passwordManagerService = moduleRef.get(PasswordManagerService);
    });

    it('/users/create (POST)', () => {
        const mockRequestBody = {
            login: 'USER',
            password: '123'
        };
        const mockUser = {
            ...mockRequestBody,
            _id: '123-abc',
        } as any;
        const mockResponseBody = { ...mockUser };
        const mockUserAction = { _id: 'abc' } as any;
        jest.clearAllMocks();
        jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(null);
        jest.spyOn(userRepository, 'create').mockReturnValueOnce(mockResponseBody);
        jest.spyOn(userActionRepository, 'create').mockReturnValueOnce(mockUserAction);

        return request(app.getHttpServer())
            .post('/users/create')
            .set('Accept', 'application/json')
            .send(mockRequestBody)
            .expect(201)
            .expect(mockResponseBody);
    });

    it('/users/login (POST)', () => {
        const mockRequestBody = {
            login: 'USER',
            password: '123'
        };
        const mockUser = {
            ...mockRequestBody,
            _id: '123-abc',
            email: 'some email',
            salt: 'salt',
            activated: 1
        } as any;
        const mockAccessToken = 'token';
        const mockRefreshToken = 'token2';
        jest.clearAllMocks();
        jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);
        jest.spyOn(passwordManagerService, 'areEqualPasswords').mockResolvedValueOnce(true);
        jest.spyOn(jwtManagerService, 'generateAccessToken').mockResolvedValue(mockAccessToken);
        jest.spyOn(jwtManagerService, 'generateRefreshToken').mockResolvedValue(mockRefreshToken);
        jest.spyOn(redisService, 'setTokens').mockResolvedValue();

        return request(app.getHttpServer())
            .post('/users/login')
            .set('Accept', 'application/json')
            .send(mockRequestBody)
            .expect(200)
            .then(res => {
                const accessToken = getCookie(res, 'accessToken');
                const refreshToken = getCookie(res, 'refreshToken');

                expect(accessToken).toBe(mockAccessToken);
                expect(refreshToken).toBe(mockRefreshToken);
            });
    });

    it('/users/logout (POST)', () => {
        return request(app.getHttpServer())
            .post('/users/logout')
            .expect(205)
            .then(res => {
                const accessCookie = getCookie(res, 'accessToken');
                const refreshCookie = getCookie(res, 'refreshToken');

                expect(accessCookie).toBeUndefined();
                expect(refreshCookie).toBeUndefined();
            });
    });

    describe('/users/refreshTokens (POST)', () => {
        it('should generate new accessToken', () => {
            const mockAccessToken = 'token';
            const mockAccessTokenPayload: UserAccessTokenPayload = {
                login: 'some login',
                expirationTimestamp: Date.now() + 10000000
            };
            const mockRefreshToken = 'token2';
            const mockNewAccessToken = 'new-token';
            const mockRefreshTokenPayload: UserRefreshTokenPayload = {
                login: 'some login',
                expirationTimestamp: Date.now() + 1000000
            };

            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValueOnce(mockAccessTokenPayload);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue(mockAccessToken);
            jest.spyOn(redisService, 'getRefreshToken').mockResolvedValueOnce(mockRefreshToken);
            jest.spyOn(jwtManagerService, 'generateAccessToken').mockResolvedValueOnce(mockNewAccessToken);
            jest.spyOn(jwtManagerService, 'verifyRefreshToken').mockResolvedValueOnce(mockRefreshTokenPayload);

            return request(app.getHttpServer())
                .post('/users/refreshTokens')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(204)
                .then(res => {
                    const accessToken = getCookie(res, 'accessToken');
                    const refreshToken = getCookie(res, 'refreshCookie');

                    expect(accessToken).toBe(mockNewAccessToken);
                    expect(refreshToken).toBeUndefined();
                });
        });
    });

    describe('/users/:login/grant/:capability (POST)', () => {
        it ('should grant a new permission when user is admin', () => {
            const mockRequestLogin = 'USER';
            const mockRequestCapability = 'canAdd';
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
                isAdmin: true
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddc',
                login: 'some user',
                password: 'hashed'
            } as any;

            const expectedStatusCode = 200;
            const expectedResult = 'true';

            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdminUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post(`/users/${mockRequestLogin}/grant/${mockRequestCapability}`)
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(expectedStatusCode)
                .expect(expectedResult);
        });

        it('should not grant permission when user already owns this permission', () => {
            const mockRequestLogin = 'USER';
            const mockRequestCapability = 'canAdd';
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
                isAdmin: true
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddc',
                login: 'some user',
                password: 'hashed',
                capabilities: {
                    [mockRequestCapability]: true
                }
            } as any;

            const expectedStatusCode = 200;
            const expectedResult = 'false';

            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdminUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post(`/users/${mockRequestLogin}/grant/${mockRequestCapability}`)
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(expectedStatusCode)
                .expect(expectedResult);
        });

        it('throw ForbiddenException when user is not an admin', () => {
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddc',
                login: 'some user',
                password: 'hashed'
            } as any;

            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdminUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/grant/some-capability')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('throw NotFoundException when user does not exist', async () => {
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.resetAllMocks();
            jest.clearAllMocks();
            jest.spyOn(userRepository, 'findByLogin').mockReturnValue(null);
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdminUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');

            const res = await request(app.getHttpServer())
                .post('/users/XNAME2/grant/some-capability')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token');

            expect(userRepository.findByLogin).lastReturnedWith(null);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('/users/:login/deny/:capability (POST)', () => {
        it ('should deny a permission when user is admin', () => {
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
                isAdmin: true
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddc',
                login: 'some-user',
                password: 'hashed',
                capabilities: {
                    canAdd: true
                }
            } as any;

            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdminUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/canAdd')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200)
                .expect('true');
        });

        it('should not deny permission when user does not own this permission', () => {
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
                isAdmin: true
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddc',
                login: 'some user',
                password: 'hashed'
            } as any;

            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdminUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/some-capability')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200)
                .expect('false');
        });

        it('throw ForbiddenException when user is not an admin', () => {
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddc',
                login: 'some user',
                password: 'hashed'
            } as any;

            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdminUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/some-capability')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('throw NotFoundException when user does not exist', () => {
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.resetAllMocks();
            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdminUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(null);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/some-capability')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(404);
        });
    });

    describe('/users/activate/:userActionId (POST)', () => {
        it('should activate user', () => {
            jest.clearAllMocks();
            jest.spyOn(userService, 'activate').mockResolvedValueOnce(undefined);

            return request(app.getHttpServer())
                .post('/users/activate/635981f6e40f61599e839aaa')
                .expect(200);
        });
    });

    describe('/users/:id/activate (POST)', () => {
        it('should fail when user tries to activate an another one', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
            } as any;

            jest.resetAllMocks();
            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(null);

            return request(app.getHttpServer())
                .post('/users/some-user-id/activate')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('should activate user', () => {
            const mockAdmin = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
                isAdmin: true,
                activated: true
            } as any;
            const mockUser = {
                _id: '355981f6e40f61599e839ddb',
                login: 'user',
                password: 'hashed'
            } as any;
            const mockUserAction = {
                _id: 'some-user-action-id',
                userId: 'some-user-id',
                type: 'activate'
            } as any;

            jest.resetAllMocks();
            jest.clearAllMocks();
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockAdmin);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(userActionRepository, 'findOne').mockResolvedValue(mockUserAction);
            jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/user-id/activate')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(204);
        });
    });
});
