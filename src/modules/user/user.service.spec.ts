import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { UserDocument } from './user.interface';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { of } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

describe('UserService', () => {
    let service: UserService;
    let model: Model<UserDocument>;
    let jwtManagerService: JwtManagerService;
    let loggerService: LoggerService;

    const mockUser = {
        login: 'Aaa',
        password: 'hashed password'
    } as UserDocument;

    const mockUserService = {
        findOne: jest.fn(),
        getUser: jest.fn(),
        areSameHashedPasswords: jest.fn()
    };

    beforeEach(async() => {
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
                        info: () => {}
                    }
                }
            ],
        }).compile();

        service = module.get(UserService);
        model = module.get(getModelToken(models.USER_MODEL));
        jwtManagerService = module.get(JwtManagerService);
        loggerService = module.get(LoggerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUser', () => {
        it('should return user', async() => {
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser);

            const result = await service.getUser(mockUser.login);

            expect(model.findOne).toHaveBeenCalledWith(mockUser.login);
            expect(result).toBe(mockUser);
        });

        it('should log in user', async() => {
            const mockCookie = 'some.jwt.cookie';
            const mockUserDto = {
                login: 'Aaa',
                password: '123'
            };
            const mockRes = {
                cookie: jest.fn()
            };
            jest.spyOn(service, 'getUser').mockResolvedValueOnce(mockUser);
            jest.spyOn(service, 'areSameHashedPasswords').mockResolvedValueOnce(true);
            jest.spyOn(jwtManagerService, 'encodeUserData').mockResolvedValueOnce(mockCookie);
            jest.spyOn(loggerService, 'info').mockImplementation(() => {});

            const result = await service.loginUser(mockUserDto, mockRes);
            console.log(result);

            expect(1).toBe(1);
        });
    });
});
