import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { UserDocument } from '../user/user.interface';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { UserService } from '../user/user.service';
import { LoggerService } from '../logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { UserActionDocument } from '../../schemas/user-action.document';
import { MailManagerService } from '../mail-manager/mail-manager.service';

// https://betterprogramming.pub/testing-controllers-in-nestjs-and-mongo-with-jest-63e1b208503c
// https://stackoverflow.com/questions/74110962/please-make-sure-that-the-argument-databaseconnection-at-index-0-is-available
// https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/

describe('AuthService', () => {
    let authService: AuthService;
    let jwtManagerService: JwtManagerService;
    let userService: UserService;
    let userModel: Model<UserDocument>;
    let userActionModel: Model<UserActionDocument>;
    let mailManagerService: MailManagerService;

    const mockAuthService = {
        getAuthorizedUser: jest.fn(() => {})
    };

    const mockUserActionProvider = {};

    const mockMailManagerProvider = {
        sendActivationMail: (email, id) => {}
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useClass: JwtService
                },
                {
                    provide: JwtManagerService,
                    useClass: JwtManagerService
                },
                {
                    provide: UserService,
                    useClass: UserService
                },
                {
                    provide: LoggerService,
                    useValue: {
                        info: () => {},
                        error: () => {}
                    }
                },
                {
                    provide: getModelToken(models.USER_MODEL),
                    useValue: mockAuthService
                },
                {
                    provide: getModelToken(models.USER_ACTION_MODEL),
                    useValue: mockUserActionProvider
                },
                {
                    provide: REDIS_CLIENT,
                    useValue: {}
                },
                {
                    provide: MailManagerService,
                    useValue: mockMailManagerProvider
                }
            ],
        }).compile();

        authService = module.get(AuthService);
        jwtManagerService = module.get(JwtManagerService);
        userService = module.get(UserService);
        userModel = module.get(getModelToken(models.USER_MODEL));
        userActionModel = module.get(getModelToken(models.USER_ACTION_MODEL));
        mailManagerService = module.get(MailManagerService);
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
        expect(jwtManagerService).toBeDefined();
        expect(userService).toBeDefined();
        expect(userModel).toBeDefined();
        expect(userActionModel).toBeDefined();
        expect(mailManagerService).toBeDefined();
    });

    describe('getAuthorizedUser', () => {
        it('should get authorized user', async () => {
            // Given
            const jwtCookie = 'eyJhbGciOiJIUzI1NiJ9.QWFh.8SkYoAsthYk2cx4xrLFuRleIBOxAaqthAWCBs71aA6A';
            const mockUser = {
                _id: '64e9f765d4e60ba693641aa1',
                login: 'Test',
                password: '$2b$12$r.ea/uOV1ZE6XWinWC8RY.l08EjrAQMx2shhcZwwrc1TIj8nAddry' // 123
            } as UserDocument;

            // When
            jest.spyOn(authService, 'getAuthorizedUser').mockResolvedValue(mockUser);
            const authorizedUser = await authService.getAuthorizedUser(jwtCookie);

            // Then
            expect(authService.getAuthorizedUser).toHaveBeenCalledWith(jwtCookie);
            expect(authorizedUser).toBe(mockUser);
        });

        it('should throw an error when user does not exist', async () => {
            // Given
            const jwtCookie = 'some cookie';

            // When
            jest.spyOn(jwtManagerService, 'decodeUserData').mockReturnValueOnce('some user name');
            jest.spyOn(userService, 'getUser').mockReturnValueOnce(null);

            // Then
            await expect(authService.getAuthorizedUser(jwtCookie)).rejects.toThrow(NotFoundException);
        });
    });
});
