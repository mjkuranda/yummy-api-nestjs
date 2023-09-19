import { INestApplication } from '@nestjs/common';
import { UserService } from '../src/modules/user/user.service';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { LoggerService } from '../src/modules/logger/logger.service';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../src/constants/models.constant';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { MealDocument } from '../src/modules/meal/meal.interface';
import { RedisModule } from '../src/modules/redis/redis.module';
import { MealService } from '../src/modules/meal/meal.service';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let jwtManagerService: JwtManagerService;
    let authService: AuthService;
    let mealService: MealService;
    let mealModel: Model<MealDocument>;
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
    const loggerServiceProvider = {
        info: () => {},
        error: () => {}
    };
    const mockMealModelProvider = {
        create: () => {},
        updateOne: () => {},
        find: () => {},
        findOne: () => {},
        findById: () => {}
    };
    const redisServiceProvider = {
        set: () => {},
        get: () => {},
        del: () => {}
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LoggerService).useValue(loggerServiceProvider)
            .overrideProvider(getModelToken(models.MEAL_MODEL)).useValue(mockMealModelProvider)
            .overrideProvider(RedisModule).useValue(redisServiceProvider)
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        userService = moduleRef.get(UserService);
        jwtManagerService = moduleRef.get(JwtManagerService);
        authService = moduleRef.get(AuthService);
        mealService = moduleRef.get(MealService);
        mealModel = moduleRef.get(getModelToken(models.MEAL_MODEL));
    });

    describe('/meals (GET)', () => {
        it('should get all available meals', () => {
            const mockMeals = [
                {
                    _id: '635981f6e40f61599e839dda',
                    title: 'X',
                    description: 'Lorem ipsum',
                    author: 'Author name',
                    ingredients: [],
                    posted: 123,
                    type: 'some type'
                },
                {
                    _id: '635981f6e40f61599e839ddb',
                    title: 'Y',
                    description: 'Lorem ipsum',
                    author: 'Author name 2',
                    ingredients: [],
                    posted: 123456,
                    type: 'some type'
                }
            ] as any[];

            jest.spyOn(mealModel, 'find').mockResolvedValueOnce(mockMeals);

            return request(app.getHttpServer())
                .get('/meals')
                .expect(200)
                .expect(mockMeals);
        });
    });

    describe('/meals/:id (GET)', () => {
        it('should find a meal with specific id', () => {
            const mockParamId = '635981f6e40f61599e839ddb';
            const mockMeal = {
                _id: '635981f6e40f61599e839ddb',
                title: 'Y',
                description: 'Lorem ipsum',
                author: 'Author name 2',
                ingredients: [],
                posted: 123456,
                type: 'some type'
            } as any;

            jest.spyOn(mealModel, 'findOne').mockReturnValueOnce(mockMeal);

            return request(app.getHttpServer())
                .get(`/meals/${mockParamId}`)
                .expect(200)
                .expect(mockMeal);
        });

        it('should not find a meal', () => {
            const mockParamId = '635981f6e40f61599e839ddb';
            const mockMeal = null;

            jest.spyOn(mealModel, 'findOne').mockReturnValueOnce(mockMeal);

            return request(app.getHttpServer())
                .get(`/meals/${mockParamId}`)
                .expect(404);
        });
    });

    describe('/meals/create (POST)', () => {
        it('should add a new meal when user is logged-in', () => {
            const mockRequestBody = {
                title: 'Title',
                description: 'Lorem ipsum',
                ingredients: ['123', '456'],
                type: 'some type'
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'user',
                password: 'hashed'
            } as any;

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockUser);

            return request(app.getHttpServer())
                .post('/meals/create')
                .set('Cookie', ['jwt=token'])
                .set('Accept', 'application/json')
                .send(mockRequestBody)
                .expect(201);
        });

        it('should throw an error, when user is not logged-in', () => {
            const mockRequestBody = {
                title: 'Title',
                description: 'Lorem ipsum',
                ingredients: ['123', '456'],
                type: 'some type'
            } as any;

            return request(app.getHttpServer())
                .post('/meals/create')
                .set('Cookie', [])
                .set('Accept', 'application/json')
                .send(mockRequestBody)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toBe('You are not authorized to execute this action. Please, log in first.');
                });
        });
    });

    describe('/meals/:id (PUT)', () => {
        it('should introduce edition when user is logged-in', () => {
            const mockRequestBody = {
                description: 'New lorem ipsum'
            } as any;
            const mockEditedMeal = {
                description: mockRequestBody.description,
                title: 'Abc',
                ingredients: ['xxx'],
                type: 'Some type'
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed'
            } as any;

            jest.spyOn(authService, 'getAuthorizedUser').mockReturnValueOnce(mockUser);
            jest.spyOn(mealService, 'edit').mockReturnValueOnce(mockEditedMeal);

            return request(app.getHttpServer())
                .put('/meals/635981f6e40f61599e839ddf')
                .set('Cookie', ['jwt=token'])
                .set('Accept', 'application/json')
                .send(mockRequestBody)
                .expect(200)
                .expect(mockEditedMeal);
        });

        it('should throw an error, when user is not logged-in', () => {
            const mockRequestBody = {
                description: 'New lorem ipsum',
            } as any;

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839ddf')
                .set('Cookie', [])
                .set('Accept', 'application/json')
                .send(mockRequestBody)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toBe('You are not authorized to execute this action. Please, log in first.');
                });
        });
    });

    // TODO: DELETE /meals/:id

    // TODO: POST /meals/:id/create

    // TODO: POST /meals/:id/edit

    // TODO: POST /meals/:id/delete
});