import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { LoggerService } from '../src/modules/logger/logger.service';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { JwtManagerService } from '../src/modules/jwt-manager/jwt-manager.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { DishRepository } from '../src/mongodb/repositories/dish.repository';
import { DetailedDish, DetailedDishWithTranslations, DishRating, RatedDish } from '../src/modules/dish/dish.types';
import { UserSearchQueryRepository } from '../src/mongodb/repositories/user-search-query.repository';
import { DishCommentRepository } from '../src/mongodb/repositories/dish-comment.repository';
import { DishRatingRepository } from '../src/mongodb/repositories/dish-rating.repository';
import { IngredientService } from '../src/modules/ingredient/ingredient.service';
import { MealType, DishType, DishProvider } from '../src/common/enums';
import { ExternalApiService } from '../src/modules/api/external-api.service';
import { UserAccessTokenPayload } from '../src/modules/jwt-manager/jwt-manager.types';
import { DishIngredient } from '../src/modules/ingredient/ingredient.types';
import { DishRatingDocument } from '../src/mongodb/documents/dish-rating.document';

describe('DishController (e2e)', () => {
    let app: INestApplication;
    let dishService: DishRepository;
    let dishRepository: DishRepository;
    let dishCommentRepository: DishCommentRepository;
    let dishRatingRepository: DishRatingRepository;
    let userSearchQueryRepository: UserSearchQueryRepository;
    let jwtManagerService: JwtManagerService;
    let redisService: RedisService;
    let externalApiService: ExternalApiService;
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
        getDishes: jest.fn(),
        findOneAvailable: jest.fn()
    };
    const mockDishRatingRepositoryProvider = {
        ...mockDishRepositoryProvider,
        getAverageRatingForDish: jest.fn()
    };
    const mockUserSearchQueryRepositoryProvider = {
        create: jest.fn(),
        findAllRecentQueries: jest.fn()
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
    const externalApiServiceProvider = {
        getAll: jest.fn().mockReturnValue([]),
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
            .overrideProvider(UserSearchQueryRepository).useValue(mockUserSearchQueryRepositoryProvider)
            .overrideProvider(RedisService).useValue(redisServiceProvider)
            .overrideProvider(JwtManagerService).useValue(jwtManagerServiceProvider)
            .overrideProvider(ExternalApiService).useValue(externalApiServiceProvider)
            .overrideProvider(IngredientService).useValue(ingredientServiceProvider)
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        dishService = moduleRef.get(DishRepository);
        dishRepository = moduleRef.get(DishRepository);
        dishCommentRepository = moduleRef.get(DishCommentRepository);
        dishRatingRepository = moduleRef.get(DishRatingRepository);
        userSearchQueryRepository = moduleRef.get(UserSearchQueryRepository);
        jwtManagerService = moduleRef.get(JwtManagerService);
        redisService = moduleRef.get(RedisService);
        externalApiService = moduleRef.get(ExternalApiService);
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

    describe('/dishes/details (GET)', () => {
        it('should return a dish when is cached', async () => {
            const mockCachedDish: DetailedDish = {
                imgUrl: 'http://example.com/image.jpg',
                title: 'some title',
                description: 'some description',
                language: 'en-US',
                readyInMinutes: 0,
                sourceOrAuthor: 'unknown',
                ingredients: [],
                provider: DishProvider.INT_DMT_USER,
                type: DishType.ANY,
                mealType: MealType.ANY
            };
            const expectedResponseBody: DetailedDishWithTranslations = {
                imgUrl: 'http://example.com/image.jpg',
                title: 'some title',
                description: 'some description',
                language: {
                    original: 'en-US',
                    translated: 'en'
                },
                readyInMinutes: 0,
                sourceOrAuthor: 'unknown',
                ingredients: {
                    original: [],
                    translated: []
                },
                provider: DishProvider.INT_DMT_USER,
                type: DishType.ANY,
                mealType: MealType.ANY
            };

            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(mockCachedDish);

            return request(app.getHttpServer())
                .get('/dishes/some-id/details')
                .set('Accept-Language', 'en')
                .expect(200)
                .expect(expectedResponseBody);
        });

        it('should throw an error when dish hasn\'t found', async () => {
            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(null);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(null);
            jest.spyOn(externalApiService, 'getDishDetails').mockReturnValueOnce([]);

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

            jest.spyOn(dishRepository, 'findOneAvailable').mockReturnValueOnce(mockDish);

            return request(app.getHttpServer())
                .get(`/dishes/${mockParamId}`)
                .expect(200)
                .expect(mockDish);
        });

        it('should not find a dish', () => {
            const mockParamId = '635981f6e40f61599e839ddb';
            const mockDish = null;

            jest.spyOn(dishRepository, 'findOneAvailable').mockReturnValueOnce(mockDish);

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

    describe('/dishes (POST)', () => {
        const mockCreateDishDto = {
            title: 'Test Dish',
            description: 'Test Description',
            ingredients: [{
                name: 'ingredient1' as const,
                amount: 1,
                unit: 'piece',
                imageUrl: 'http://example.com/ingredient1.jpg'
            } as DishIngredient],
            language: 'en',
            type: DishType.MAIN_COURSE,
            mealType: MealType.DINNER,
            readyInMinutes: 30,
            imageUrl: 'http://example.com/image.jpg',
            provider: DishProvider.INT_DMT_USER
        };

        const mockAccessToken = 'mock-access-token';
        const mockUser: UserAccessTokenPayload = {
            login: 'testUser',
            expirationTimestamp: Date.now() + 900000, // 15 minutes
            capabilities: { canAdd: true, canEdit: true }
        };

        beforeEach(() => {
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(ingredientService, 'wrapIngredientsWithImages').mockResolvedValue([
                {
                    name: 'ingredient1',
                    amount: 1,
                    unit: 'piece',
                    imageUrl: 'http://example.com/ingredient1.jpg'
                } as DishIngredient
            ]);
        });

        it('should create a new dish successfully', () => {
            const mockCreatedDish = {
                ...mockCreateDishDto,
                id: 'new-dish-id',
                author: mockUser.login
            };

            jest.spyOn(dishRepository, 'create').mockResolvedValue(mockCreatedDish as any);

            return request(app.getHttpServer())
                .post('/dishes')
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .send(mockCreateDishDto)
                .expect(201)
                .expect(res => {
                    expect(res.body).toMatchObject(mockCreatedDish);
                });
        });

        it('should return 400 when creating dish with invalid data', () => {
            const invalidDishDto = {
                ...mockCreateDishDto,
                ingredients: [] // Empty ingredients list should fail validation
            };

            return request(app.getHttpServer())
                .post('/dishes')
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .send(invalidDishDto)
                .expect(400);
        });

        it('should return 401 when creating dish without authentication', () => {
            return request(app.getHttpServer())
                .post('/dishes')
                .send(mockCreateDishDto)
                .expect(401);
        });
    });

    describe('/dishes/:id/comments (POST)', () => {
        const mockDishId = 'test-dish-id';
        const mockAccessToken = 'mock-access-token';
        const mockUser: UserAccessTokenPayload = {
            login: 'testUser',
            expirationTimestamp: Date.now() + 900000,
            capabilities: { canAdd: true }
        };
        const mockComment = {
            text: 'This is a test comment'
        };

        beforeEach(() => {
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'hasDish').mockResolvedValue(true);
        });

        it('should add a comment to a dish successfully', () => {
            const mockCreatedComment = {
                ...mockComment,
                id: 'new-comment-id',
                dishId: mockDishId,
                user: mockUser.login,
                posted: expect.any(Number)
            };

            jest.spyOn(dishCommentRepository, 'create').mockResolvedValue(mockCreatedComment as any);

            return request(app.getHttpServer())
                .post(`/dishes/${mockDishId}/comments`)
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .send(mockComment)
                .expect(201)
                .expect(res => {
                    expect(res.body).toMatchObject(mockCreatedComment);
                });
        });

        it('should return 404 when commenting on non-existent dish', () => {
            jest.spyOn(redisService, 'hasDish').mockResolvedValue(false);

            return request(app.getHttpServer())
                .post(`/dishes/${mockDishId}/comments`)
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .send(mockComment)
                .expect(404);
        });
    });

    describe('/dishes/:id/rating (POST)', () => {
        const mockDishId = 'test-dish-id';
        const mockAccessToken = 'mock-access-token';
        const mockUser: UserAccessTokenPayload = {
            login: 'testUser',
            expirationTimestamp: Date.now() + 900000,
            capabilities: { canAdd: true }
        };

        beforeEach(() => {
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'hasDish').mockResolvedValue(true);
        });

        it('should add a rating to a dish successfully', () => {
            const mockRatingDoc: DishRatingDocument = {
                dishId: mockDishId,
                user: mockUser.login,
                rating: 4,
                posted: Date.now()
            } as DishRatingDocument;

            jest.spyOn(dishRatingRepository, 'create').mockResolvedValue(mockRatingDoc);
            jest.spyOn(dishRatingRepository, 'getAverageRatingForDish').mockResolvedValue({
                dishId: mockDishId,
                rating: 4,
                count: 1
            });

            return request(app.getHttpServer())
                .post(`/dishes/${mockDishId}/rating`)
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .send({ rating: 4 })
                .expect(201)
                .expect(res => {
                    expect(res.body).toMatchObject({
                        rating: 4,
                        averageRating: 4
                    });
                });
        });

        it('should return 400 when rating value is invalid', () => {
            return request(app.getHttpServer())
                .post(`/dishes/${mockDishId}/rating`)
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .send({ rating: 6 }) // Invalid rating value
                .expect(400);
        });
    });

    describe('/dishes/:id (PUT)', () => {
        const mockDishId = 'test-dish-id';
        const mockAccessToken = 'mock-access-token';
        const mockUser: UserAccessTokenPayload = {
            login: 'testUser',
            expirationTimestamp: Date.now() + 900000,
            capabilities: { canEdit: true }
        };
        const mockUpdateDishDto = {
            title: 'Updated Dish Title',
            description: 'Updated description',
            ingredients: [{
                name: 'updated-ingredient' as const,
                amount: 2,
                unit: 'pieces',
                imageUrl: 'http://example.com/updated-ingredient.jpg'
            } as DishIngredient]
        };

        beforeEach(() => {
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'hasDish').mockResolvedValue(true);
            jest.spyOn(ingredientService, 'wrapIngredientsWithImages').mockResolvedValue(mockUpdateDishDto.ingredients);
        });

        it('should update a dish successfully', () => {
            const mockUpdatedDish = {
                id: mockDishId,
                ...mockUpdateDishDto,
                author: mockUser.login
            };

            jest.spyOn(dishRepository, 'updateOne').mockResolvedValue(mockUpdatedDish as any);

            return request(app.getHttpServer())
                .put(`/dishes/${mockDishId}`)
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .send(mockUpdateDishDto)
                .expect(200)
                .expect(res => {
                    expect(res.body).toMatchObject(mockUpdatedDish);
                });
        });

        it('should return 404 when updating non-existent dish', () => {
            jest.spyOn(redisService, 'hasDish').mockResolvedValue(false);

            return request(app.getHttpServer())
                .put(`/dishes/${mockDishId}`)
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .send(mockUpdateDishDto)
                .expect(404);
        });
    });

    describe('/dishes/:id (DELETE)', () => {
        const mockDishId = 'test-dish-id';
        const mockAccessToken = 'mock-access-token';
        const mockUser: UserAccessTokenPayload = {
            login: 'testUser',
            expirationTimestamp: Date.now() + 900000,
            capabilities: { canEdit: true }
        };

        beforeEach(() => {
            jest.spyOn(jwtManagerService, 'verifyAccessToken').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'hasDish').mockResolvedValue(true);
        });

        it('should delete a dish successfully', () => {
            jest.spyOn(dishRepository, 'updateOne').mockResolvedValue({ acknowledged: true } as any);

            return request(app.getHttpServer())
                .delete(`/dishes/${mockDishId}`)
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .expect(200);
        });

        it('should return 404 when deleting non-existent dish', () => {
            jest.spyOn(redisService, 'hasDish').mockResolvedValue(false);

            return request(app.getHttpServer())
                .delete(`/dishes/${mockDishId}`)
                .set('Authorization', `Bearer ${mockAccessToken}`)
                .expect(404);
        });

        it('should return 401 when deleting without authentication', () => {
            return request(app.getHttpServer())
                .delete(`/dishes/${mockDishId}`)
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
            jest.spyOn(userSearchQueryRepository, 'findAllRecentQueries').mockResolvedValueOnce(mockSearchQueries);
            jest.spyOn(externalApiService, 'getDishes').mockReturnValueOnce(mockDishes);

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

    afterAll(async () => {
        await app.close();
    });
});