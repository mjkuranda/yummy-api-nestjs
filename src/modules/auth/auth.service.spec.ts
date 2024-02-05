import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserDocument } from '../../mongodb/documents/user.document';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { UserService } from '../user/user.service';
import { LoggerService } from '../logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { MailManagerService } from '../mail-manager/mail-manager.service';
import { UserRepository } from '../../mongodb/repositories/user.repository';
import { UserActionRepository } from '../../mongodb/repositories/user.action.repository';

// https://betterprogramming.pub/testing-controllers-in-nestjs-and-mongo-with-jest-63e1b208503c
// https://stackoverflow.com/questions/74110962/please-make-sure-that-the-argument-databaseconnection-at-index-0-is-available
// https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/

describe('AuthService', () => {
    let authService: AuthService;
    let jwtManagerService: JwtManagerService;
    let userService: UserService;
    let userRepository: UserRepository;
    let userActionRepository: UserActionRepository;
    let mailManagerService: MailManagerService;

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
                    provide: UserRepository,
                    useValue: { findByLogin: () => {} }
                },
                {
                    provide: UserActionRepository,
                    useValue: {}
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
        userRepository = module.get(UserRepository);
        userActionRepository = module.get(UserActionRepository);
        mailManagerService = module.get(MailManagerService);
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
        expect(jwtManagerService).toBeDefined();
        expect(userService).toBeDefined();
        expect(userRepository).toBeDefined();
        expect(userActionRepository).toBeDefined();
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
            jest.spyOn(userRepository, 'findByLogin').mockReturnValueOnce(null);

            // Then
            await expect(authService.getAuthorizedUser(jwtCookie)).rejects.toThrow(NotFoundException);
        });
    });
});
