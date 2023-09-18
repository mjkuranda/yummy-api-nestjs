import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '../src/modules/user/user.module';
import { UserService } from '../src/modules/user/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../src/constants/models.constant';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import { LoggerService } from '../src/modules/logger/logger.service';
import { REDIS_CLIENT } from '../src/modules/redis/redis.constants';
import { RedisService } from '../src/modules/redis/redis.service';
import { LoggerModule } from '../src/modules/logger/logger.module';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let jwtManagerService: JwtManagerService;
    const getCookie = (res, cookieName) => {
        const cookies = {};
        res.headers['set-cookie'][0]
            .split('; ')
            .forEach(cookie => {
                const [key, value] = cookie.split('=');

                cookies[key] = value;
            });

        return cookies[cookieName] !== ''
            ? cookies[cookieName]
            : undefined;
    };
    const mockUserService = {
        findOne: jest.fn(),
        getUser: jest.fn(),
        areSameHashedPasswords: jest.fn(),
        create: jest.fn().mockImplementation((user) => ({
            ...user,
            _id: '123-abc',
            password: 'hashed'
        })),
        updateOne: jest.fn()
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [UserModule, LoggerModule],
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
            ]
        })
            .overrideProvider(LoggerService).useValue({ info: jest.fn(), error: jest.fn() })
            .overrideProvider(RedisService).useValue({})
            .overrideProvider(getModelToken(models.USER_MODEL)).useValue(mockUserService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        userService = moduleFixture.get(UserService);
        jwtManagerService = moduleFixture.get(JwtManagerService);
    });

    it('/users/create (POST)', () => {
        const mockRequestBody = {
            login: 'USER',
            password: '123'
        };
        const mockResponseBody = {
            ...mockRequestBody,
            _id: '123-abc',
            password: 'hashed'
        };

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
            password: 'hashed'
        } as any;
        const mockJwtToken = 'token';
        const mockResponseBody = { ...mockUser };
        jest.spyOn(userService, 'getUser').mockReturnValueOnce(mockUser);
        jest.spyOn(userService, 'areSameHashedPasswords').mockReturnValueOnce(Promise.resolve(true));
        jest.spyOn(jwtManagerService, 'encodeUserData').mockReturnValueOnce(Promise.resolve(mockJwtToken));

        return request(app.getHttpServer())
            .post('/users/login')
            .set('Accept', 'application/json')
            .send(mockRequestBody)
            .expect(200)
            .expect(mockResponseBody)
            .then(res => {
                const jwtCookie = getCookie(res, 'jwt');

                expect(jwtCookie).toBe(mockJwtToken);
            });
    });

    it('/users/logout (POST)', () => {
        return request(app.getHttpServer())
            .post('/users/logout')
            .expect(200)
            .then(res => {
                const jwtCookie = getCookie(res, 'jwt');

                expect(jwtCookie).toBeUndefined();
            });
    });

    describe('/users/:login/grant/:capability (POST)', () => {
        it ('should fail when user does not exist', () => {
            const mockRequestLogin = 'USER';
            const mockRequestCapability = 'canAdd';
            const mockRequestJwtToken = 'token';

            return request(app.getHttpServer())
                .post(`/users/${mockRequestLogin}/grant/${mockRequestCapability}`)
                .set({ jwt: mockRequestJwtToken })
                .expect(400)
                .then(res => {
                    expect(res.body.message).toBe('Failed action to grant a permission. User with provided login does not exist.');
                });
        });
    });
});
