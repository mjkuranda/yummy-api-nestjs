import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../src/modules/user/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../src/constants/models.constant';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { UserDocument } from '../src/modules/user/user.interface';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from '../src/modules/logger/logger.service';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let jwtManagerService: JwtManagerService;
    let authService: AuthService;
    let userModel: Model<UserDocument>;
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
        findById: () => {}
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LoggerService).useValue({ info: () => {}, error: () => {} })
            .overrideProvider(getModelToken(models.USER_MODEL)).useValue(mockUserModelProvider)
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        userService = moduleRef.get(UserService);
        jwtManagerService = moduleRef.get(JwtManagerService);
        authService = moduleRef.get(AuthService);
        userModel = moduleRef.get(getModelToken(models.USER_MODEL));
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
        jest.spyOn(userService, 'getUser').mockReturnValueOnce(null);
        jest.spyOn(userModel, 'create').mockReturnValueOnce(mockResponseBody);

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

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(mockUser);

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

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(mockUser);

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

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/users/some-user/grant/some-capability')
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

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(null);

            return request(app.getHttpServer())
                .post('/users/some-user/grant/some-capability')
                .set('Cookie', ['jwt=token'])
                .expect(404);
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

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(mockUser);

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

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(mockUser);

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

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(mockUser);

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

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockAdminUser);
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(null);

            return request(app.getHttpServer())
                .post('/users/some-user/deny/some-capability')
                .set('Cookie', ['jwt=token'])
                .expect(404);
        });
    });
});
