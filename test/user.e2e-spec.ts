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
    });

    it('/users/create (POST)', () => {
        return request(app.getHttpServer())
            .post('/users/create')
            .send({ login: 'USER', password: '123' })
            .expect(201)
            .expect('Hello World!');
    });
});
