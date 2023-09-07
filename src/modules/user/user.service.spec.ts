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

    const mockUser = {
        login: 'Aaa',
        password: 'hashed password'
    };

    const mockUserService = {
        // getUser: jest.fn(),
        findOne: jest.fn()
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
                        get: () => of({ data: [] })
                    }
                }
            ],
        }).compile();

        service = module.get(UserService);
        model = module.get(getModelToken(models.USER_MODEL));
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
    });
});
