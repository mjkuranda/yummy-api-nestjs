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
import { DetailedMeal, DetailedMealWithTranslations, MealRating, RatedMeal } from '../src/modules/meal/meal.types';
import { SearchQueryRepository } from '../src/mongodb/repositories/search-query.repository';
import { MealCommentRepository } from '../src/mongodb/repositories/meal-comment.repository';
import { MealRatingRepository } from '../src/mongodb/repositories/meal-rating.repository';
import { IngredientService } from '../src/modules/ingredient/ingredient.service';
import { MealType } from '../src/common/enums';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let mealService: MealService;
    let mealRepository: MealRepository;
    let mealCommentRepository: MealCommentRepository;
    let mealRatingRepository: MealRatingRepository;
    let searchQueryRepository: SearchQueryRepository;
    let jwtManagerService: JwtManagerService;
    let redisService: RedisService;
    let spoonacularApiService: SpoonacularApiService;
    let ingredientService: IngredientService;

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
    const mockMealRatingRepositoryProvider = {
        ...mockMealRepositoryProvider,
        getAverageRatingForMeal: jest.fn()
    };
    const redisServiceProvider = {
        set: jest.fn(),
        get: jest.fn(),
        del: jest.fn(),
        hasMeal: jest.fn(),
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
    const ingredientServiceProvider = {
        wrapIngredientsWithImages: jest.fn(),
        filterIngredients: jest.fn(),
        applyWithImages: jest.fn()
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LoggerService).useValue(loggerServiceProvider)
            .overrideProvider(MealRepository).useValue(mockMealRepositoryProvider)
            .overrideProvider(MealCommentRepository).useValue(mockMealRepositoryProvider)
            .overrideProvider(MealRatingRepository).useValue(mockMealRatingRepositoryProvider)
            .overrideProvider(SearchQueryRepository).useValue(mockMealRepositoryProvider)
            .overrideProvider(RedisService).useValue(redisServiceProvider)
            .overrideProvider(JwtManagerService).useValue(jwtManagerServiceProvider)
            .overrideProvider(SpoonacularApiService).useValue(spoonacularApiServiceProvider)
            .overrideProvider(IngredientService).useValue(ingredientServiceProvider)
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        mealService = moduleRef.get(MealService);
        mealRepository = moduleRef.get(MealRepository);
        mealCommentRepository = moduleRef.get(MealCommentRepository);
        mealRatingRepository = moduleRef.get(MealRatingRepository);
        searchQueryRepository = moduleRef.get(SearchQueryRepository);
        jwtManagerService = moduleRef.get(JwtManagerService);
        redisService = moduleRef.get(RedisService);
        spoonacularApiService = moduleRef.get(SpoonacularApiService);
        ingredientService = moduleRef.get(IngredientService);
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
                ingredients: [],
                provider: 'yummy',
                type: MealType.ANY
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
                    provider: 'yummy',
                    type: MealType.ANY
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

    describe('/meals/:id/comments (GET)', () => {
        it('should receive all comments for a particular meal', () => {
            const mockMealId = 'mock meal id';
            const mockHasMeal: boolean = true;
            const mockMealComments: any[] = [
                {
                    mealId: mockMealId,
                    user: 'mock user name',
                    text: 'That\'s an awesome meal ever!',
                    posted: Date.now()
                }
            ];

            jest.spyOn(redisService, 'hasMeal').mockResolvedValueOnce(mockHasMeal);
            jest.spyOn(mealCommentRepository, 'findAll').mockResolvedValueOnce(mockMealComments);

            return request(app.getHttpServer())
                .get(`/meals/${mockMealId}/comments`)
                .expect(200)
                .expect(mockMealComments);
        });
    });

    describe('/meals/:id/rating (GET)', () => {
        it('should receive all rating for a particular meal', () => {
            const mockMealId = 'mock meal id';
            const mockHasMeal: boolean = true;
            const mockMealRating: MealRating = {
                mealId: mockMealId,
                rating: 8.14,
                count: 123
            };

            jest.spyOn(redisService, 'hasMeal').mockResolvedValueOnce(mockHasMeal);
            jest.spyOn(mealRatingRepository, 'getAverageRatingForMeal').mockResolvedValueOnce(mockMealRating);

            return request(app.getHttpServer())
                .get(`/meals/${mockMealId}/rating`)
                .expect(200)
                .expect(mockMealRating);
        });
    });

    describe('/meals/:id/comment (POST)', () => {
        it('should post a new comment for a particular meal', () => {
            const mockMealId = 'mock meal id';
            const mockRequestBody = {
                mealId: mockMealId,
                user: 'mock user name',
                text: 'That\'s an awesome meal ever!'
            } as any;
            const mockMealComment = {
                ...mockRequestBody,
                posted: Date.now()
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'user',
                password: 'hashed'
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(redisService, 'hasMeal').mockResolvedValueOnce(true);
            jest.spyOn(mealCommentRepository, 'create').mockResolvedValueOnce(mockMealComment);

            return request(app.getHttpServer())
                .post(`/meals/${mockMealId}/comment`)
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer token')
                .send(mockRequestBody)
                .expect(201);
        });
    });

    describe('/meals/:id/rating (POST)', () => {
        it('should post a new rating for a specific meal', () => {
            const mockMealId = 'mock meal id';
            const mockRequestBody = {
                mealId: mockMealId,
                user: 'mock user name',
                rating: 10
            } as any;
            const mockMealRating = {
                ...mockRequestBody,
                posted: Date.now()
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'user',
                password: 'hashed'
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(redisService, 'hasMeal').mockResolvedValueOnce(true);
            jest.spyOn(mealRatingRepository, 'create').mockResolvedValueOnce(mockMealRating);

            return request(app.getHttpServer())
                .post(`/meals/${mockMealId}/rating`)
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer token')
                .send(mockRequestBody)
                .expect(200);
        });
    });

    describe('/meals/create (POST)', () => {
        it('should add a new meal when user is logged-in', () => {
            const mockRequestBody = {
                title: 'Title',
                description: 'Lorem ipsum',
                ingredients: ['123', '456'],
                type: 'some type',
                imageUrl: '2e99e91d-7bd0-4ec8-89a6-ea9a6604a4f7.jpg'
            } as any;
            const mockUser = {
                _id: '635981f6e40f61599e839ddb',
                login: 'user',
                password: 'hashed'
            } as any;
            const mockIngredients = ['123', '456'] as any;
            const accessToken = 'token';

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue(accessToken);
            jest.spyOn(ingredientService, 'wrapIngredientsWithImages').mockResolvedValueOnce(mockIngredients);

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

            jest.spyOn(ingredientService, 'filterIngredients').mockReturnValueOnce(['carrot', 'apple', 'fish']);

            return request(app.getHttpServer())
                .post('/meals/proposal')
                .set('Authorization', 'Bearer token')
                .set('Accept', 'application/json')
                .send({ ingredients })
                .expect(204);
        });
    });
});