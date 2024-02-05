import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../src/modules/user/user.service';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from '../src/modules/logger/logger.service';
import { MailManagerService } from '../src/modules/mail-manager/mail-manager.service';
import { UserRepository } from '../src/repositories/user.repository';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let userRepository: UserRepository;
    let jwtManagerService: JwtManagerService;
    let authService: AuthService;

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
    const mockUserModelProvider = {
        create: () => {},
        updateOne: () => {},
        find: () => {},
        findById: () => {},
        findByLogin: () => {}
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LoggerService).useValue({ info: () => {}, error: () => {} })
            .overrideProvider(UserRepository).useValue(mockUserModelProvider)
            .overrideProvider(MailManagerService).useValue({ sendActivationMail: jest.fn((email, id) => {}) })
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        userService = moduleRef.get(UserService);
        userRepository = moduleRef.get(UserRepository);
        jwtManagerService = moduleRef.get(JwtManagerService);
        authService = moduleRef.get(AuthService);
    });

    it('/users/create (POST)', () => {
        const mockRequestBody = {
            login: 'USER',
            password: '123'
        };
        const mockUser = {
            ...mockRequestBody,
            _id: '123-abc',
            password: 'hashed'
        } as any;
        const mockResponseBody = { ...mockUser };
        jest.clearAllMocks();
        jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(null);
        jest.spyOn(userRepository, 'create').mockReturnValueOnce(mockResponseBody);

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
            password: 'hashed',
            activated: 1
        } as any;
        const mockJwtToken = 'token';
        const mockResponseBody = { ...mockUser };
        jest.clearAllMocks();
        jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);
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
            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post(`/users/${mockRequestLogin}/grant/${mockRequestCapability}`)
                .set('Cookie', ['jwt=token'])
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
            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post(`/users/${mockRequestLogin}/grant/${mockRequestCapability}`)
                .set('Cookie', ['jwt=token'])
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
            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/grant/some-capability')
                .set('Cookie', ['jwt=token'])
                .expect(403)
                .then(res => {
                    expect(res.body.message).toBe(`User "${mockAdminUser.login}" is not authorized to execute this action.`);
                });
        });

        it('throw NotFoundException when user does not exist X', async () => {
            const mockAdminUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'XNAME',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.resetAllMocks();
            jest.clearAllMocks();
            jest.spyOn(userRepository, 'findByLogin').mockReturnValue(null);
            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);

            const res = await request(app.getHttpServer())
                .post('/users/XNAME2/grant/some-capability')
                .set('Cookie', ['jwt=token']);

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
            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/canAdd')
                .set('Cookie', ['jwt=token'])
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
            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/some-capability')
                .set('Cookie', ['jwt=token'])
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
            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/some-capability')
                .set('Cookie', ['jwt=token'])
                .expect(403)
                .then(res => {
                    expect(res.body.message).toBe(`User "${mockAdminUser.login}" is not authorized to execute this action.`);
                });
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
            jest.spyOn(authService, 'getAuthorizedUser').mockResolvedValueOnce(mockAdminUser);
            jest.spyOn(userRepository, 'findByLogin').mockResolvedValueOnce(null);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/some-capability')
                .set('Cookie', ['jwt=token'])
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
});
