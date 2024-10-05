import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { LoggerService } from '../src/modules/logger/logger.service';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { DishService } from '../src/modules/dish/dish.service';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { DishRepository } from '../src/mongodb/repositories/dish.repository';
import { SpoonacularApiService } from '../src/modules/api/spoonacular/spoonacular.api.service';
import { DetailedDish, DetailedDishWithTranslations, DishRating, RatedDish } from '../src/modules/dish/dish.types';
import { SearchQueryRepository } from '../src/mongodb/repositories/search-query.repository';
import { DishCommentRepository } from '../src/mongodb/repositories/dish-comment.repository';
import { DishRatingRepository } from '../src/mongodb/repositories/dish-rating.repository';
import { IngredientService } from '../src/modules/ingredient/ingredient.service';
import { MealType, DishType } from '../src/common/enums';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let dishService: DishService;
    let dishRepository: DishRepository;
    let dishCommentRepository: DishCommentRepository;
    let dishRatingRepository: DishRatingRepository;
    let searchQueryRepository: SearchQueryRepository;
    let jwtManagerService: JwtManagerService;
    let redisService: RedisService;
    let spoonacularApiService: SpoonacularApiService;
    let ingredientService: IngredientService;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const mockDishRepositoryProvider = {
        create: () => {},
        updateOne: () => {},
        findAll: () => {},
        findOne: () => {},
        findById: () => {},
        getDishes: jest.fn()
    };
    const mockDishRatingRepositoryProvider = {
        ...mockDishRepositoryProvider,
        getAverageRatingForDish: jest.fn()
    };
    const redisServiceProvider = {
        set: jest.fn(),
        get: jest.fn(),
        del: jest.fn(),
        hasDish: jest.fn(),
        encodeKey: jest.fn(),
        getAccessToken: jest.fn(),
        getDishDetails: jest.fn()
    };
    const jwtManagerServiceProvider = {
        generateAccessToken: jest.fn(),
        verifyAccessToken: jest.fn()
    };
    const spoonacularApiServiceProvider = {
        getDishes: jest.fn(),
        getDishDetails: jest.fn()
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
            .overrideProvider(DishRepository).useValue(mockDishRepositoryProvider)
            .overrideProvider(DishCommentRepository).useValue(mockDishRepositoryProvider)
            .overrideProvider(DishRatingRepository).useValue(mockDishRatingRepositoryProvider)
            .overrideProvider(SearchQueryRepository).useValue(mockDishRepositoryProvider)
            .overrideProvider(RedisService).useValue(redisServiceProvider)
            .overrideProvider(JwtManagerService).useValue(jwtManagerServiceProvider)
            .overrideProvider(SpoonacularApiService).useValue(spoonacularApiServiceProvider)
            .overrideProvider(IngredientService).useValue(ingredientServiceProvider)
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        dishService = moduleRef.get(DishService);
        dishRepository = moduleRef.get(DishRepository);
        dishCommentRepository = moduleRef.get(DishCommentRepository);
        dishRatingRepository = moduleRef.get(DishRatingRepository);
        searchQueryRepository = moduleRef.get(SearchQueryRepository);
        jwtManagerService = moduleRef.get(JwtManagerService);
        redisService = moduleRef.get(RedisService);
        spoonacularApiService = moduleRef.get(SpoonacularApiService);
        ingredientService = moduleRef.get(IngredientService);
    });

    describe('/dishes (GET)', () => {
        it('should get all matching dishes', () => {
            const dishResult: RatedDish[] = [];

            jest.spyOn(dishService, 'getDishes').mockImplementation(jest.fn());
            jest.spyOn(dishService, 'getDishes').mockResolvedValue(dishResult);

            return request(app.getHttpServer())
                .get('/dishes?ings=carrot,tomato&type=soup')
                .expect(200)
                .expect(dishResult);
        });

        it('should throw an error when no query are provided', () => {
            return request(app.getHttpServer())
                .get('/dishes')
                .expect(400);
        });

        it('should throw an error when no ingredients are provided', () => {
            return request(app.getHttpServer())
                .get('/dishes?ings')
                .expect(400);
        });
    });

    describe('/dishes/:id/details', () => {
        it('should return a dish when is cached', async () => {
            const mockCachedDish: DetailedDish = {
                id: 'some-id',
                title: 'some title',
                description: 'some description',
                language: 'en',
                readyInMinutes: 0,
                sourceOrAuthor: 'unknown',
                recipeSections: [],
                ingredients: [],
                provider: 'yummy',
                type: MealType.ANY,
                dishType: DishType.ANY
            };
            const expectedResponseBody: DetailedDishWithTranslations = {
                dish: {
                    id: 'some-id',
                    title: 'some title',
                    description: 'some description',
                    language: 'en',
                    readyInMinutes: 0,
                    sourceOrAuthor: 'unknown',
                    recipeSections: [],
                    ingredients: [],
                    provider: 'yummy',
                    type: MealType.ANY,
                    dishType: DishType.ANY
                },
                description: 'some description',
                ingredients: [],
                recipe: []
            };

            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(mockCachedDish);

            return request(app.getHttpServer())
                .get('/dishes/some-id/details')
                .expect(200)
                .expect(expectedResponseBody);
        });

        it('should throw an error when dish hasn\'t found', async () => {
            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(null);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(null);
            jest.spyOn(spoonacularApiService, 'getDishDetails').mockResolvedValueOnce(null);

            return request(app.getHttpServer())
                .get('/dishes/some-id/details')
                .expect(404);
        });
    });

    describe('/dishes/:id (GET)', () => {
        it('should find a dish with specific id', () => {
            const mockParamId = '635981f6e40f61599e839ddb';
            const mockDish = {
                _id: '635981f6e40f61599e839ddb',
                title: 'Y',
                description: 'Lorem ipsum',
                author: 'Author name 2',
                ingredients: [],
                posted: 123456,
                type: 'some type'
            } as any;

            jest.spyOn(dishRepository, 'findOne').mockReturnValueOnce(mockDish);

            return request(app.getHttpServer())
                .get(`/dishes/${mockParamId}`)
                .expect(200)
                .expect(mockDish);
        });

        it('should not find a dish', () => {
            const mockParamId = '635981f6e40f61599e839ddb';
            const mockDish = null;

            jest.spyOn(dishRepository, 'findOne').mockReturnValueOnce(mockDish);

            return request(app.getHttpServer())
                .get(`/dishes/${mockParamId}`)
                .expect(404);
        });
    });

    describe('/dishes/:id/comments (GET)', () => {
        it('should receive all comments for a particular dish', () => {
            const mockDishId = 'mock dish id';
            const mockHasDish: boolean = true;
            const mockDishComments: any[] = [
                {
                    dishId: mockDishId,
                    user: 'mock user name',
                    text: 'That\'s an awesome dish ever!',
                    posted: Date.now()
                }
            ];

            jest.spyOn(redisService, 'hasDish').mockResolvedValueOnce(mockHasDish);
            jest.spyOn(dishCommentRepository, 'findAll').mockResolvedValueOnce(mockDishComments);

            return request(app.getHttpServer())
                .get(`/dishes/${mockDishId}/comments`)
                .expect(200)
                .expect(mockDishComments);
        });
    });

    describe('/dishes/:id/rating (GET)', () => {
        it('should receive all rating for a particular dish', () => {
            const mockDishId = 'mock dish id';
            const mockHasDish: boolean = true;
            const mockDishRating: DishRating = {
                dishId: mockDishId,
                rating: 8.14,
                count: 123
            };

            jest.spyOn(redisService, 'hasDish').mockResolvedValueOnce(mockHasDish);
            jest.spyOn(dishRatingRepository, 'getAverageRatingForDish').mockResolvedValueOnce(mockDishRating);

            return request(app.getHttpServer())
                .get(`/dishes/${mockDishId}/rating`)
                .expect(200)
                .expect(mockDishRating);
        });
    });

    describe('/dishes/:id/comment (POST)', () => {
        it('should post a new comment for a particular dish', () => {
            const mockDishId = 'mock dish id';
            const mockRequestBody = {
                dishId: mockDishId,
                user: 'mock user name',
                text: 'That\'s an awesome dish ever!'
            } as any;
            const mockDishComment = {
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
            jest.spyOn(redisService, 'hasDish').mockResolvedValueOnce(true);
            jest.spyOn(dishCommentRepository, 'create').mockResolvedValueOnce(mockDishComment);

            return request(app.getHttpServer())
                .post(`/dishes/${mockDishId}/comment`)
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer token')
                .send(mockRequestBody)
                .expect(201);
        });
    });

    describe('/dishes/:id/rating (POST)', () => {
        it('should post a new rating for a specific dish', () => {
            const mockDishId = 'mock dish id';
            const mockRequestBody = {
                dishId: mockDishId,
                user: 'mock user name',
                rating: 10
            } as any;
            const mockDishRating = {
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
            jest.spyOn(redisService, 'hasDish').mockResolvedValueOnce(true);
            jest.spyOn(dishRatingRepository, 'create').mockResolvedValueOnce(mockDishRating);

            return request(app.getHttpServer())
                .post(`/dishes/${mockDishId}/rating`)
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer token')
                .send(mockRequestBody)
                .expect(200);
        });
    });

    describe('/dishes/create (POST)', () => {
        it('should add a new dish when user is logged-in', () => {
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
                .post('/dishes/create')
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
                .post('/dishes/create')
                .set('Cookie', [])
                .set('Accept', 'application/json')
                .send(mockRequestBody)
                .expect(401);
        });
    });

    describe('/dishes/:id (PUT)', () => {
        it('should introduce edition when user is logged-in', () => {
            const mockRequestBody = {
                description: 'New lorem ipsum'
            } as any;
            const mockEditedDish = {
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
            jest.spyOn(dishService, 'edit').mockReturnValueOnce(mockEditedDish);

            return request(app.getHttpServer())
                .put('/dishes/635981f6e40f61599e839ddf')
                .set('Cookie', ['accessToken=token'])
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer token')
                .send(mockRequestBody)
                .expect(200)
                .expect(mockEditedDish);
        });

        it('should throw an error, when user is not logged-in', () => {
            const mockRequestBody = {
                description: 'New lorem ipsum',
            } as any;

            return request(app.getHttpServer())
                .put('/dishes/635981f6e40f61599e839ddf')
                .set('Cookie', [])
                .set('Accept', 'application/json')
                .send(mockRequestBody)
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe('Not provided accessToken.');
                });
        });
    });

    describe('/dishes/:id (DELETE)', () => {
        it('should mark as soft-deleted when user is logged-in', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed'
            } as any;
            const mockDeletedDish = {} as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(dishService, 'delete').mockReturnValueOnce(mockDeletedDish);

            return request(app.getHttpServer())
                .delete('/dishes/635981f6e40f61599e839ddf')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(204);
        });

        it('should throw an error, when user is not logged-in', () => {
            return request(app.getHttpServer())
                .delete('/dishes/635981f6e40f61599e839ddf')
                .set('Cookie', [])
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe('Not provided accessToken.');
                });
        });
    });

    describe('/dishes/:id/create (POST)', () => {
        it('should confirm adding a new dish when user is an admin', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(dishService, 'confirmCreating').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/create')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should confirm adding a new dish when user has canAdd capability', () => {
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
            jest.spyOn(dishService, 'confirmCreating').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/create')
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
                .post('/dishes/635981f6e40f61599e839aaa/create')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('should fail when you are not logged-in', () => {
            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/create')
                .set('Cookie', [])
                .expect(401);
        });
    });

    describe('/dishes/:id/edit (POST)', () => {
        it('should confirm editing a dish when user is an admin', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(dishService, 'confirmEditing').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/edit')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should confirm editing a dish when user has canEdit capability', () => {
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
            jest.spyOn(dishService, 'confirmEditing').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/edit')
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
                .post('/dishes/635981f6e40f61599e839aaa/edit')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('should fail when you are not logged-in', () => {
            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/edit')
                .set('Cookie', [])
                .expect(401);
        });
    });

    describe('/dishes/:id/delete (POST)', () => {
        it('should confirm deleting a dish when user is an admin', () => {
            const mockUser = {
                _id: '635981f6e40f61599e839aaa',
                login: 'user',
                password: 'hashed',
                isAdmin: true
            } as any;

            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'getAccessToken').mockResolvedValue('token');
            jest.spyOn(dishService, 'confirmDeleting').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/delete')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(200);
        });

        it('should confirm deleting a dish when user has canDelete capability', () => {
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
            jest.spyOn(dishService, 'confirmDeleting').mockReturnValueOnce({} as any);

            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/delete')
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
                .post('/dishes/635981f6e40f61599e839aaa/delete')
                .set('Cookie', ['accessToken=token'])
                .set('Authorization', 'Bearer token')
                .expect(403);
        });

        it('should fail when you are not logged-in', () => {
            return request(app.getHttpServer())
                .post('/dishes/635981f6e40f61599e839aaa/delete')
                .set('Cookie', [])
                .expect(401);
        });
    });

    describe('/dishes/proposal/all (GET)', () => {
        it('should get proposal dishes', () => {
            const mockUser: any = { login: 'login', expirationTimestamp: new Date(Date.now() + 50000) };
            const mockSearchQueries: any = [
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot'] },
                { login: 'login', date: new Date(), ingredients: ['carrot'] },
                { login: 'login', date: new Date(), ingredients: ['onion'] }
            ];
            const mockDishes: any = [
                { id: '1', title: 'title1', ingredients: ['carrot', 'fish', 'garlic'] },
                { id: '2', title: 'title2', ingredients: ['carrot', 'fish'] }
            ];
            const mockDishResult: any = [
                { id: '1', title: 'title1', ingredients: ['carrot', 'fish', 'garlic'], recommendationPoints: 8 },
                { id: '2', title: 'title2', ingredients: ['carrot', 'fish'], recommendationPoints: 5 }
            ];

            jest.spyOn(dishRepository, 'getDishes').mockResolvedValue([]);
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(searchQueryRepository, 'findAll').mockResolvedValueOnce(mockSearchQueries);
            jest.spyOn(spoonacularApiService, 'getDishes').mockResolvedValueOnce(mockDishes);

            return request(app.getHttpServer())
                .get('/dishes/proposal/all')
                .set('Authorization', 'Bearer token')
                .expect(mockDishResult)
                .expect(200);
        });
    });

    describe('/dishes/proposal (POST)', () => {
        it('should add a new record with provided ingredients', () => {
            const ingredients = ['carrot', 'apple', 'fish'];

            jest.spyOn(ingredientService, 'filterIngredients').mockReturnValueOnce(['carrot', 'apple', 'fish']);

            return request(app.getHttpServer())
                .post('/dishes/proposal')
                .set('Authorization', 'Bearer token')
                .set('Accept', 'application/json')
                .send({ ingredients })
                .expect(204);
        });
    });
});