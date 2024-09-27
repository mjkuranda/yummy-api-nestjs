import { INestApplication } from '@nestjs/common';
import { ImageService } from '../src/modules/image/image.service';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import { MealService } from '../src/modules/meal/meal.service';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import request from 'supertest';
import path from 'path';
import { LoggerService } from '../src/modules/logger/logger.service';
import { RedisService } from '../src/modules/redis/redis.service';

describe('ImageController (e2e)', () => {
    let app: INestApplication;
    let imageService: ImageService;
    let redisService: RedisService;
    let jwtManagerService: JwtManagerService;

    const loggerServiceProvider = {
        info: () => {},
        error: () => {}
    };

    const redisServiceProvider = {
        set: jest.fn(),
        get: jest.fn(),
        del: jest.fn(),
        encodeKey: jest.fn(),
        getAccessToken: jest.fn(),
        getMealDetails: jest.fn()
    };

    const jwtManagerServiceProvider = {
        generateAccessToken: jest.fn(),
        verifyAccessToken: jest.fn()
    };

    beforeEach(async () => {
        process.env.NODE_ENV = 'test';

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LoggerService).useValue(loggerServiceProvider)
            .overrideProvider(RedisService).useValue(redisServiceProvider)
            .overrideProvider(JwtManagerService).useValue(jwtManagerServiceProvider)
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        imageService = moduleRef.get(MealService);
        jwtManagerService = moduleRef.get(JwtManagerService);
        redisService = moduleRef.get(RedisService);
    });

    describe('/images/upload (POST)', () => {
        it('should upload a new image', async () => {
            const mockUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'user',
                password: 'hashed',
                capabilities: {
                    canAdd: true
                }
            } as any;
            const accessToken = 'token';

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue(accessToken);

            const response = await request(app.getHttpServer())
                .post('/images/upload')
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/jpg')
                .set('Authorization', 'Bearer token')
                .attach('image', path.join(__dirname, '..', 'test', 'image-test.jpg'))
                .expect(201);

            expect(response.body).toBeDefined();
        });

        it('should throw an error when you are not logged-in', () => {
            return request(app.getHttpServer())
                .post('/images/upload')
                .set('Accept', 'application/jpg')
                .attach('image', path.join(__dirname, '..', 'test', 'image-test.jpg'))
                .expect(401);
        });

        it('should throw an error when you do not have canAdd capability', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'user',
                password: 'hashed'
            } as any;
            const accessToken = 'token';

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue(accessToken);

            return request(app.getHttpServer())
                .post('/images/upload')
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/jpg')
                .set('Authorization', 'Bearer token')
                .attach('image', path.join(__dirname, '..', 'test', 'image-test.jpg'))
                .expect(403);
        });

        it('should throw an error when no image provided', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'user',
                password: 'hashed',
                capabilities: {
                    canAdd: true
                }
            } as any;
            const accessToken = 'token';

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue(accessToken);

            return request(app.getHttpServer())
                .post('/images/upload')
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/jpg')
                .set('Authorization', 'Bearer token')
                .expect(400);
        });
    });
});