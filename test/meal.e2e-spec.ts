import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { LoggerService } from '../src/modules/logger/logger.service';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { MealService } from '../src/modules/meal/meal.service';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { MealRepository } from '../src/mongodb/repositories/meal.repository';
import { SpoonacularApiService } from '../src/modules/api/spoonacular/spoonacular.api.service';
import { DetailedMeal, DetailedMealWithTranslations, RatedMeal } from '../src/modules/meal/meal.types';
import { SearchQueryRepository } from '../src/mongodb/repositories/search-query.repository';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let mealService: MealService;
    let mealRepository: MealRepository;
    let searchQueryRepository: SearchQueryRepository;
    let jwtManagerService: JwtManagerService;
    let redisService: RedisService;
    let spoonacularApiService: SpoonacularApiService;

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
    const mockMealRepositoryProvider = {
        create: () => {},
        updateOne: () => {},
        findAll: () => {},
        findOne: () => {},
        findById: () => {}
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
    const spoonacularApiServiceProvider = {
        getMeals: jest.fn(),
        getMealDetails: jest.fn()
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LoggerService).useValue(loggerServiceProvider)
            .overrideProvider(MealRepository).useValue(mockMealRepositoryProvider)
            .overrideProvider(SearchQueryRepository).useValue(mockMealRepositoryProvider)
            .overrideProvider(RedisService).useValue(redisServiceProvider)
            .overrideProvider(JwtManagerService).useValue(jwtManagerServiceProvider)
            .overrideProvider(SpoonacularApiService).useValue(spoonacularApiServiceProvider)
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        mealService = moduleRef.get(MealService);
        mealRepository = moduleRef.get(MealRepository);
        searchQueryRepository = moduleRef.get(SearchQueryRepository);
        jwtManagerService = moduleRef.get(JwtManagerService);
        redisService = moduleRef.get(RedisService);
        spoonacularApiService = moduleRef.get(SpoonacularApiService);
    });

    describe('/meals (GET)', () => {
        it('should get all matching meals', () => {
            const mealResult: RatedMeal[] = [];

            jest.spyOn(mealService, 'getMeals').mockImplementation(jest.fn());
            jest.spyOn(mealService, 'getMeals').mockResolvedValue(mealResult);

            return request(app.getHttpServer())
                .get('/meals?ings=carrot,tomato&type=soup')
                .expect(200)
                .expect(mealResult);
        });

        it('should throw an error when no query are provided', () => {
            return request(app.getHttpServer())
                .get('/meals')
                .expect(400);
        });

        it('should throw an error when no ingredients are provided', () => {
            return request(app.getHttpServer())
                .get('/meals?ings')
                .expect(400);
        });
    });

    describe('/meals/:id/details', () => {
        it('should return a meal when is cached', async () => {
            const mockCachedMeal: DetailedMeal = {
                id: 'some-id',
                title: 'some title',
                description: 'some description',
                language: 'en',
                readyInMinutes: 0,
                sourceOrAuthor: 'unknown',
                recipeSections: [],
                ingredients: []
            };
            const expectedResponseBody: DetailedMealWithTranslations = {
                meal: {
                    id: 'some-id',
                    title: 'some title',
                    description: 'some description',
                    language: 'en',
                    readyInMinutes: 0,
                    sourceOrAuthor: 'unknown',
                    recipeSections: [],
                    ingredients: [],
                },
                ingredients: [],
                recipe: []
            };

            jest.spyOn(redisService, 'getMealDetails').mockResolvedValueOnce(mockCachedMeal);

            return request(app.getHttpServer())
                .get('/meals/some-id/details')
                .expect(200)
                .expect(expectedResponseBody);
        });

        it('should throw an error when meal hasn\'t found', async () => {
            jest.spyOn(redisService, 'getMealDetails').mockResolvedValueOnce(null);
            jest.spyOn(mealRepository, 'findById').mockResolvedValueOnce(null);
            jest.spyOn(spoonacularApiService, 'getMealDetails').mockResolvedValueOnce(null);

            return request(app.getHttpServer())
                .get('/meals/some-id/details')
                .expect(404);
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

            jest.spyOn(mealRepository, 'findOne').mockReturnValueOnce(mockMeal);

            return request(app.getHttpServer())
                .get(`/meals/${mockParamId}`)
                .expect(200)
                .expect(mockMeal);
        });

        it('should not find a meal', () => {
            const mockParamId = '635981f6e40f61599e839ddb';
            const mockMeal = null;

            jest.spyOn(mealRepository, 'findOne').mockReturnValueOnce(mockMeal);

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
            const accessToken = 'token';

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue(accessToken);

            return request(app.getHttpServer())
                .post('/meals/create')
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer token')
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
                .expect(401);
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
            const accessToken = 'token';

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue(accessToken);
            jest.spyOn(mealService, 'edit').mockReturnValueOnce(mockEditedMeal);

            return request(app.getHttpServer())
                .put('/meals/635981f6e40f61599e839ddf')
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer token')
                .send(mockRequestBody)
                .expect(200)
                .expect(mockEditedMeal);
        });

        it('should throw an error, when user is not logged-in', () => {
            const mockRequestBody = {
                description: 'New lorem ipsum',
            } as any;

            return request(app.getHttpServer())
                .put('/meals/635981f6e40f61599e839ddf')
                .set('Cookie', [])
                .set('Accept', 'application/json')
                .send(mockRequestBody)
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe('Not provided accessToken.');
                });
        });
    });

    describe('/meals/:id (DELETE)', () => {
        it('should mark as soft-deleted when user is logged-in', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed'
            } as any;
            const mockDeletedMeal = {} as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(mealService, 'delete').mockReturnValueOnce(mockDeletedMeal);

            return request(app.getHttpServer())
                .delete('/meals/635981f6e40f61599e839ddf')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(204);
        });

        it('should throw an error, when user is not logged-in', () => {
            return request(app.getHttpServer())
                .delete('/meals/635981f6e40f61599e839ddf')
                .set('Cookie', [])
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe('Not provided accessToken.');
                });
        });
    });

    describe('/meals/:id/create (POST)', () => {
        it('should confirm adding a new meal when user is an admin', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(mealService, 'confirmCreating').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/create')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should confirm adding a new meal when user has canAdd capability', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                capabilities: {
                    canAdd: true
                }
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(mealService, 'confirmCreating').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/create')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should fail when user has not sufficient capabilities', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed'
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/create')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('should fail when you are not logged-in', () => {
            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/create')
                .set('Cookie', [])
                .expect(401);
        });
    });

    describe('/meals/:id/edit (POST)', () => {
        it('should confirm editing a meal when user is an admin', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(mealService, 'confirmEditing').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/edit')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should confirm editing a meal when user has canEdit capability', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                capabilities: {
                    canEdit: true
                }
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(mealService, 'confirmEditing').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/edit')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should fail when user has not sufficient capabilities', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed'
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/edit')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('should fail when you are not logged-in', () => {
            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/edit')
                .set('Cookie', [])
                .expect(401);
        });
    });

    describe('/meals/:id/delete (POST)', () => {
        it('should confirm deleting a meal when user is an admin', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(mealService, 'confirmDeleting').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/delete')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should confirm deleting a meal when user has canDelete capability', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                capabilities: {
                    canDelete: true
                }
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(mealService, 'confirmDeleting').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/delete')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should fail when user has not sufficient capabilities', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed'
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');

            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/delete')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('should fail when you are not logged-in', () => {
            return request(app.getHttpServer())
                .post('/meals/635981f6e40f61599e839aaa/delete')
                .set('Cookie', [])
                .expect(401);
        });
    });

    describe('/meals/proposal/all (GET)', () => {
        it('should get proposal meals', () => {
            const mockUser: any = { login: 'login', expirationTimestamp: new Date(Date.now() + 50000) };
            const mockSearchQueries: any = [
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot'] },
                { login: 'login', date: new Date(), ingredients: ['carrot'] },
                { login: 'login', date: new Date(), ingredients: ['onion'] }
            ];
            const mockMeals: any = [
                { id: '1', title: 'title1', ingredients: ['carrot', 'fish', 'garlic'] },
                { id: '2', title: 'title2', ingredients: ['carrot', 'fish'] }
            ];
            const mockMealResult: any = [
                { id: '1', title: 'title1', ingredients: ['carrot', 'fish', 'garlic'], recommendationPoints: 8 },
                { id: '2', title: 'title2', ingredients: ['carrot', 'fish'], recommendationPoints: 5 }
            ];

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(searchQueryRepository, 'findAll').mockResolvedValueOnce(mockSearchQueries);
            jest.spyOn(spoonacularApiService, 'getMeals').mockResolvedValueOnce(mockMeals);

            return request(app.getHttpServer())
                .get('/meals/proposal/all')
                .set('Authorization', 'Bearer token')
                .expect(mockMealResult)
                .expect(200);
        });
    });

    describe('/meals/proposal (POST)', () => {
        it('should add a new record with provided ingredients', () => {
            const ingredients = ['carrot', 'apple', 'fish'];

            return request(app.getHttpServer())
                .post('/meals/proposal')
                .set('Authorization', 'Bearer token')
                .set('Accept', 'application/json')
                .send({ ingredients })
                .expect(204);
        });
    });
});