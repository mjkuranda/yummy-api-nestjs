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

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let jwtManagerService: JwtManagerService;
    let authService: AuthService;
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
});