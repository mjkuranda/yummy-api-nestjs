import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { DishService } from './dish.service';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { RedisService } from '../redis/redis.service';
import { UserDto } from '../user/user.dto';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { SpoonacularApiService } from '../api/spoonacular/spoonacular.api.service';
import { DishType, IngredientName, MealType } from '../../common/enums';
import { DishRating, ProposedDish, RatedDish } from './dish.types';
import { proceedDishDocumentToDishDetails } from './dish.utils';
import { IngredientService } from '../ingredient/ingredient.service';
import { SearchQueryRepository } from '../../mongodb/repositories/search-query.repository';
import { DishCommentRepository } from '../../mongodb/repositories/dish-comment.repository';
import { CreateDishCommentBody, CreateDishRatingBody } from './dish.dto';
import { DishCommentDocument } from '../../mongodb/documents/dish-comment.document';
import { DishRatingRepository } from '../../mongodb/repositories/dish-rating.repository';
import { DishRatingDocument } from '../../mongodb/documents/dish-rating.document';
import { AxiosService } from '../../services/axios.service';

describe('DishService', () => {
    let dishService: DishService;
    let dishRepository: DishRepository;
    let dishCommentRepository: DishCommentRepository;
    let dishRatingRepository: DishRatingRepository;
    let searchQueryRepository: SearchQueryRepository;
    let redisService: RedisService;
    let ingredientService: IngredientService;
    let spoonacularApiService: SpoonacularApiService;
    let axiosService: AxiosService;

    const mockDishService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn(),
        replaceOne: jest.fn(),
        deleteOne: jest.fn(),
        calculateAverage: jest.fn(),
        getDishes: jest.fn()
    };

    const mockDishRepository = {
        ...mockDishService,
        delete: jest.fn()
    };

    const mockDishCommentRepository = {
        ...mockDishService,
        deleteAll: jest.fn()
    };

    const mockDishRatingRepository = {
        ...mockDishService,
        getAverageRatingForDish: jest.fn(),
        updateAndReturnDocument: jest.fn(),
        deleteAll: jest.fn()
    };

    const mockSpoonacularApiService = {
        getDishes: jest.fn(),
        getDishDetails: jest.fn()
    };

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn()
    };

    const mockRedisService = {
        get: jest.fn(),
        set: jest.fn(),
        unset: jest.fn(),
        hasDish: jest.fn(),
        deleteDish: jest.fn(),
        encodeKey: jest.fn(),
        getDishResult: jest.fn(),
        saveDishResult: jest.fn(),
        getDishDetails: jest.fn(),
        saveDishDetails: jest.fn()
    };

    const mockAxiosService = {
        get: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DishService,
                IngredientService,
                { provide: DishRepository, useValue: mockDishRepository },
                { provide: DishCommentRepository, useValue: mockDishCommentRepository },
                { provide: DishRatingRepository, useValue: mockDishRatingRepository },
                { provide: SearchQueryRepository, useValue: mockDishService },
                { provide: JwtService, useClass: JwtService },
                { provide: JwtManagerService, useClass: JwtManagerService },
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: SpoonacularApiService, useValue: mockSpoonacularApiService },
                { provide: AxiosService, useValue: mockAxiosService }
            ],
        }).compile();

        dishService = module.get(DishService);
        dishRepository = module.get(DishRepository);
        dishCommentRepository = module.get(DishCommentRepository);
        dishRatingRepository = module.get(DishRatingRepository);
        searchQueryRepository = module.get(SearchQueryRepository);
        redisService = module.get(RedisService);
        ingredientService = module.get(IngredientService);
        spoonacularApiService = module.get(SpoonacularApiService);
        axiosService = module.get(AxiosService);
    });

    it('should be defined', () => {
        expect(dishService).toBeDefined();
        expect(dishRepository).toBeDefined();
        expect(dishCommentRepository).toBeDefined();
        expect(dishRatingRepository).toBeDefined();
        expect(searchQueryRepository).toBeDefined();
        expect(redisService).toBeDefined();
        expect(ingredientService).toBeDefined();
        expect(spoonacularApiService).toBeDefined();
        expect(axiosService).toBeDefined();
    });

    describe('create', () => {
        let mockDishDto;
        let mockDish;
        let mockUserDto;

        beforeAll(() => {
            mockDishDto = {
                author: 'Author',
                description: 'Description of the dish',
                ingredients: ['xxx', 'yyy', 'zzz'],
                posted: new Date().getTime(),
                type: 'Dish type'
            };
            mockDish = {
                ...mockDishDto,
                softAdded: true,
                _id: '123456789'
            };
            mockUserDto = {
                login: 'user'
            };
        });

        it('should create a new dish', async () => {
            const mockWrappedElements: any[] = ['xxx', 'yyy', 'zzz'];

            jest.spyOn(dishRepository, 'create').mockResolvedValue(mockDish);
            jest.spyOn(ingredientService, 'wrapIngredientsWithImages').mockResolvedValue(mockWrappedElements);

            const result = await dishService.create(mockDishDto, mockUserDto);

            expect(result).toBe(mockDish);
        });
    });

    describe('confirmCreating', () => {
        it('should confirm created dish and save to the cache', async () => {
            const mockId = 'xxx';
            const mockDish = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softAdded: true
            } as any;
            const mockAddedDish = {
                ...mockDish,
                softAdded: undefined
            } as any;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById')
                .mockReturnValueOnce(mockDish)
                .mockReturnValueOnce(mockAddedDish);

            const result = await dishService.confirmCreating(mockId, mockUser);

            expect(result).toBe(mockAddedDish);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockAddedDish, 'dish');
        });
    });

    describe('edit', () => {
        it('should edit a dish', async () => {
            const mockId = 'xxx';
            const mockDish = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z']
            } as any;
            const editedDishDto = {
                description: 'Lorem ipsum 2',
                author: 'X',
                ingredients: [{
                    imageUrl: 'https://site.com/path',
                    name: 'X',
                    amount: 5,
                    unit: 'pieces'
                }]
            };
            const mockEditedDish = {
                mockDish: mockDish,
                softEdited: editedDishDto
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById')
                .mockReturnValueOnce(mockDish)
                .mockReturnValueOnce(mockEditedDish);

            const result = await dishService.edit(mockId, editedDishDto);

            expect(result).toBe(mockEditedDish);
        });
    });

    describe('confirmEditing', () => {
        it('should confirm editing dish and update cache', async () => {
            const mockId = 'xxx';
            const mockDish = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softEdited: {
                    description: 'Lorem ipsum 2'
                }
            } as any;
            const mockEditedDish = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum 2',
                author: 'X',
                ingredients: ['x', 'y', 'z']
            } as any;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById')
                .mockReturnValueOnce(mockDish)
                .mockReturnValueOnce(mockEditedDish);

            const result = await dishService.confirmEditing(mockId, mockUser);

            expect(result).toStrictEqual(mockEditedDish);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockEditedDish, 'dish');
        });
    });

    describe('delete', () => {
        it('should soft delete a dish and remove from cache', async () => {
            const mockId = 'xxx';
            const mockDish = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z']
            } as any;
            const mockDeletedDish = {
                ...mockDish,
                softDeleted: true
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById')
                .mockReturnValueOnce(mockDish)
                .mockReturnValueOnce(mockDeletedDish);

            const result = await dishService.delete(mockId);

            expect(result).toBe(mockDeletedDish);
            expect(redisService.deleteDish).toHaveBeenCalled();
            expect(redisService.deleteDish).toHaveBeenCalledWith(mockId);
        });
    });

    describe('confirmDeleting', () => {
        it('should confirm deleting dish', async () => {
            const mockId = 'xxx';
            const mockDish = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softDeleted: true
            } as any;
            const mockDeletedDish = null;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById')
                .mockReturnValueOnce(mockDish)
                .mockReturnValueOnce(mockDeletedDish);

            const result = await dishService.confirmDeleting(mockId, mockUser);

            expect(result).toBe(mockDeletedDish);
        });
    });

    describe('getDishes', () => {
        it('should return cached query', async () => {
            const ings: IngredientName[] = [IngredientName.CARROT, IngredientName.TOMATO];
            const mealType: MealType = MealType.DINNER;
            const cachedResult: RatedDish[] = [
                {
                    id: 'some-id',
                    ingredients: [],
                    missingCount: 1,
                    relevance: 50,
                    title: 'some-dish',
                    provider: 'yummy',
                    type: DishType.ANY,
                    mealType: MealType.ANY
                }
            ];

            jest.spyOn(redisService, 'getDishResult').mockResolvedValue(cachedResult);

            const result = await dishService.getDishes(ings, mealType);

            expect(result).toBe(cachedResult);
        });

        it('should build new query from various APIs when cache is empty and save query', async () => {
            const ings: IngredientName[] = [IngredientName.CARROT, IngredientName.TOMATO];
            const mealType: MealType = MealType.DINNER;
            const cachedResult = null;
            const mockResult: RatedDish[] = [
                {
                    id: 'some-id',
                    ingredients: [],
                    missingCount: 1,
                    relevance: 50,
                    title: 'some-dish',
                    provider: 'yummy',
                    type: DishType.ANY,
                    mealType: MealType.ANY
                }
            ];

            jest.spyOn(redisService, 'getDishResult').mockResolvedValue(cachedResult);
            jest.spyOn(dishRepository, 'getDishes').mockResolvedValue([]);
            jest.spyOn(spoonacularApiService, 'getDishes').mockResolvedValue(mockResult);
            jest.spyOn(redisService, 'saveDishResult').mockResolvedValue();

            const result = await dishService.getDishes(ings, mealType);

            expect(result).toStrictEqual(mockResult);
            expect(redisService.saveDishResult).toHaveBeenCalled();
        });
    });

    describe('getDishDetails', () => {
        it('should throw an error when id is not provided', async () => {
            await expect(dishService.getDishDetails(null)).rejects.toThrow(BadRequestException);
        });

        it('should return a dish when found its in cache', async () => {
            const mockCachedDish: any = {};
            const mockId = 'id';

            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(mockCachedDish);

            const result = await dishService.getDishDetails(mockId);

            expect(result).toStrictEqual(mockCachedDish);
        });

        it('should return a dish when found its in local database and cache it', async () => {
            const mockDish: any = {
                id: '5cabe64dcf0d4447fa60f5e2',
                ingredients: [
                    { name: 'x', amount: 1, unit: 'y' }
                ]
            };
            const resultDish = proceedDishDocumentToDishDetails(mockDish);
            const mockId = '5cabe64dcf0d4447fa60f5e2';

            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(null);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDish);

            const result = await dishService.getDishDetails(mockId);

            expect(result).toStrictEqual(resultDish);
            expect(dishRepository.findById).toHaveBeenCalledWith(mockId);
            expect(redisService.saveDishDetails).toHaveBeenCalled();
        });

        it('should return a dish when found its in an external API and cache it', async () => {
            const mockDish: any = {
                id: 'xyz',
                ingredients: [
                    { name: 'x', amount: 1, unit: 'y' }
                ]
            };
            const resultDish = proceedDishDocumentToDishDetails(mockDish);
            const mockId = '5cabe64dcf0d4447fa60f5e2';

            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(null);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(null);
            jest.spyOn(spoonacularApiService, 'getDishDetails').mockResolvedValueOnce(resultDish);

            const result = await dishService.getDishDetails(mockId);

            expect(result).toStrictEqual(resultDish);
            expect(redisService.saveDishDetails).toHaveBeenCalled();
        });

        it('should throw an error when dish with provided id hasn\'t found', async () => {
            const mockId = '5cabe64dcf0d4447fa60f5e2';

            jest.spyOn(redisService, 'getDishDetails').mockResolvedValueOnce(null);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(null);
            jest.spyOn(spoonacularApiService, 'getDishDetails').mockResolvedValueOnce(null);

            await expect(dishService.getDishDetails(mockId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('find', () => {
        it('should throw an error when provided invalid MongoDB id', async () => {
            const mockInvalidId = 'invalid id';
            const mockIsValidObjectId = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(false);

            await expect(dishService.find(mockInvalidId)).rejects.toThrow(BadRequestException);
            expect(mockIsValidObjectId).toHaveBeenCalledWith(mockInvalidId);
        });

        it('should throw an error when dish with provided id not found', async () => {
            const mockId = '64e9f765d4e60ba693641aa1';
            const mockFilter = {
                _id: mockId,
                softAdded: { $exists: false },
                softDeleted: { $exists: false }
            };
            const mockCachedDish = null;
            jest.spyOn(redisService, 'get').mockReturnValueOnce(mockCachedDish);
            jest.spyOn(dishRepository, 'findOne').mockReturnValueOnce(null);

            await expect(dishService.find(mockId)).rejects.toThrow(NotFoundException);
            expect(redisService.get).toHaveBeenCalled();
            expect(redisService.get).toReturnWith(mockCachedDish);
            expect(dishRepository.findOne).toHaveBeenCalledWith(mockFilter);
        });

        it('should find a specific dish when cache is empty and save to the cache', async () => {
            const mockId = '64e9f765d4e60ba693641aa1';
            const mockCachedDish = null;
            const mockDish = {
                _id: mockId,
                name: 'Dish name'
            } as any;
            const mockFilter = {
                _id: mockId,
                softAdded: { $exists: false },
                softDeleted: { $exists: false }
            };
            jest.spyOn(redisService, 'get').mockReturnValueOnce(mockCachedDish);
            jest.spyOn(dishRepository, 'findOne').mockReturnValueOnce(mockDish);

            const result = await dishService.find(mockId);

            expect(result).toBe(mockDish);
            expect(redisService.get).toHaveBeenCalled();
            expect(redisService.get).toReturnWith(mockCachedDish);
            expect(dishRepository.findOne).toHaveBeenCalledWith(mockFilter);
            expect(redisService.set).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should find all dishes', async () => {
            const mockDishes = [
                { name: 'Dish 1' },
                { name: 'Dish 2' }
            ] as any[];
            jest.spyOn(dishRepository, 'findAll').mockResolvedValue(mockDishes);

            const result = await dishService.findAll();

            expect(result).toBe(mockDishes);
        });
    });

    describe('getDishProposal', () => {
        it('should get received dishes from all integrated APIs', async () => {
            const user: any = { login: 'login', expirationTimestamp: new Date(Date.now() + 50000) };
            const mockSearchQueries: any = [
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot'] },
                { login: 'login', date: new Date(), ingredients: ['carrot'] },
                { login: 'login', date: new Date(), ingredients: ['onion'] }
            ];
            const mockDishes: any[] = [
                { id: '1', title: 'title1', ingredients: ['carrot', 'fish', 'garlic'], provider: 'yummy', type: DishType.ANY, mealType: MealType.ANY },
                { id: '2', title: 'title2', ingredients: ['carrot', 'fish'], provider: 'yummy', type: DishType.ANY, mealType: MealType.ANY }
            ];
            const mockDishResult: ProposedDish[] = [
                { id: '1', title: 'title1', ingredients: ['carrot', 'fish', 'garlic'], recommendationPoints: 8, provider: 'yummy', type: DishType.ANY, mealType: MealType.ANY },
                { id: '2', title: 'title2', ingredients: ['carrot', 'fish'], recommendationPoints: 5, provider: 'yummy', type: DishType.ANY, mealType: MealType.ANY }
            ];

            jest.spyOn(searchQueryRepository, 'findAll').mockResolvedValueOnce(mockSearchQueries);
            jest.spyOn(spoonacularApiService, 'getDishes').mockResolvedValueOnce(mockDishes);

            const result = await dishService.getDishProposal(user);

            expect(result).toStrictEqual(mockDishResult);
        });
    });

    describe('addDishProposal', () => {
        it('should add a new record with provided ingredients', async () => {
            const user: any = { id: '1' };
            const ingredients: any = ['carrot', 'apple', 'fish'];

            jest.spyOn(ingredientService, 'filterIngredients').mockReturnValueOnce(ingredients);

            await dishService.addDishProposal(user, ingredients);

            expect(ingredientService.filterIngredients).toHaveBeenCalledWith(ingredients);
            expect(searchQueryRepository.create).toHaveBeenCalled();
        });
    });

    describe('hasDish', () => {
        it('should return true when dish is cached', async () => {
            const mockDishId = 'mock dish id';

            jest.spyOn(redisService, 'hasDish').mockResolvedValueOnce(true);

            const hasDish = await dishService.hasDish(mockDishId);

            expect(hasDish).toBeTruthy();
        });

        it('should return true when is not cached but is in mongo', async () => {
            const mockDishId = 'mock dish id';
            const mockDish: any = { _id: mockDishId };

            jest.spyOn(redisService, 'hasDish').mockResolvedValueOnce(false);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(mockDish);

            const hasDish = await dishService.hasDish(mockDishId);

            expect(hasDish).toBeTruthy();
        });

        it('should return true when is not cached but is in external database', async () => {
            const mockDishId = 'mock dish id';
            const mockDish: any = { _id: mockDishId };

            jest.spyOn(redisService, 'hasDish').mockResolvedValueOnce(false);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(false);
            jest.spyOn(spoonacularApiService, 'getDishDetails').mockResolvedValueOnce(mockDish);

            const hasDish = await dishService.hasDish(mockDishId);

            expect(hasDish).toBeTruthy();
        });

        it('should return false when does not exist', async () => {
            const mockDishId = 'mock dish id';

            jest.spyOn(redisService, 'hasDish').mockResolvedValueOnce(false);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(dishRepository, 'findById').mockResolvedValueOnce(null);

            const hasDish = await dishService.hasDish(mockDishId);

            expect(hasDish).toBeFalsy();
        });
    });

    describe('getComments', () => {
        it('should return all comments for a particular dish', async () => {
            const mockDishId = 'mock dish id';
            const mockDishComments: any[] = [
                {
                    dishId: mockDishId,
                    user: 'mock user name',
                    text: 'That\'s an awesome dish ever!',
                    posted: Date.now()
                }
            ];

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(true);
            jest.spyOn(dishCommentRepository, 'findAll').mockResolvedValueOnce(mockDishComments);

            const dishComments = await dishService.getComments(mockDishId);

            expect(dishComments).toHaveLength(1);
            expect(dishComments[0]).toStrictEqual(mockDishComments[0]);
        });

        it('should throw an error when dish with provided ID does not exist', async () => {
            const mockDishId = 'mock dish id';

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(false);

            await expect(dishService.getComments(mockDishId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('addComment', () => {
        it('should add a new comment for a particular dish', async () => {
            const createDishCommentDto: CreateDishCommentBody = {
                dishId: 'mock dish id',
                text: 'That\'s an awesome dish ever!'
            };
            const mockDishComment = {
                ...createDishCommentDto,
                posted: Date.now()
            } as DishCommentDocument;

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(true);
            jest.spyOn(dishCommentRepository, 'create').mockResolvedValueOnce(mockDishComment);

            const result = await dishService.addComment(createDishCommentDto, 'user name');

            expect(result).toBeUndefined();
        });

        it('should throw an error when dish with provided ID does not exist', async () => {
            const createDishCommentDto: CreateDishCommentBody = {
                dishId: 'mock dish id',
                text: 'That\'s an awesome dish ever!'
            };

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(false);

            await expect(dishService.addComment(createDishCommentDto, 'user name')).rejects.toThrow(NotFoundException);
        });
    });

    describe('calculateRating', () => {
        it('should return rating for dish', async () => {
            const mockDishId = 'mock dish id';
            const mockDishRating: DishRating = {
                dishId: mockDishId,
                rating: 7.44,
                count: 712
            };

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(true);
            jest.spyOn(dishRatingRepository, 'getAverageRatingForDish').mockResolvedValueOnce(mockDishRating);

            const dishRating = await dishService.calculateRating(mockDishId);

            expect(dishRating).toStrictEqual(mockDishRating);
        });

        it('should throw an error when dish with provided ID does not exist', async () => {
            const mockDishId = 'mock dish id';

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(false);

            await expect(dishService.calculateRating(mockDishId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('addRating', () => {
        it('should add a new rating for a specific dish', async () => {
            const createDishRatingDto: CreateDishRatingBody = {
                dishId: 'mock dish id',
                rating: 7
            };
            const mockDishRating = {
                ...createDishRatingDto,
                posted: Date.now()
            } as DishRatingDocument;

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(true);
            jest.spyOn(dishRatingRepository, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(dishRatingRepository, 'create').mockResolvedValueOnce(mockDishRating);

            const rating = await dishService.addRating(createDishRatingDto, 'user name');

            expect(rating).toStrictEqual(mockDishRating);
        });

        it('should change a rating when rating exists', async () => {
            const createDishRatingDto: CreateDishRatingBody = {
                dishId: 'mock dish id',
                rating: 10
            };
            const mockExistingRating = {
                _id: 'abc',
                dishId: 'mock dish id',
                user: 'mock user name',
                rating: 7,
                posted: Date.now() - 5000
            } as DishRatingDocument;
            const mockDishRating = {
                ...createDishRatingDto,
                posted: Date.now()
            } as any;

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(true);
            jest.spyOn(dishRatingRepository, 'findOne').mockResolvedValueOnce(mockExistingRating);
            jest.spyOn(dishRatingRepository, 'updateAndReturnDocument').mockResolvedValueOnce(mockDishRating);
            jest.spyOn(dishRatingRepository, 'create').mockResolvedValueOnce(mockDishRating);

            const rating = await dishService.addRating(createDishRatingDto, 'user name');

            expect(rating).toStrictEqual(mockDishRating);
            expect(rating.rating).toEqual(mockDishRating.rating);
            expect(dishRatingRepository.updateAndReturnDocument).toHaveBeenCalled();
        });

        it('should throw an error when dish with provided ID does not exist', async () => {
            const createDishRatingDto: CreateDishRatingBody = {
                dishId: 'mock dish id',
                rating: 7
            };

            jest.spyOn(dishService, 'hasDish').mockResolvedValueOnce(false);

            await expect(dishService.addRating(createDishRatingDto, 'user name')).rejects.toThrow(NotFoundException);
        });
    });
});
