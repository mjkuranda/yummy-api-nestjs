import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { LoggerService } from '../logger/logger.service';
import { MealService } from './meal.service';
import { BadRequestException } from '../../exceptions/bad-request.exception';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { RedisService } from '../redis/redis.service';
import { UserDto } from '../user/user.dto';
import { MealRepository } from '../../mongodb/repositories/meal.repository';
import { SpoonacularApiService } from '../api/spoonacular/spoonacular.api.service';
import { IngredientName, MealType } from '../../common/enums';
import { MealRating, RatedMeal } from './meal.types';
import { proceedMealDocumentToMealDetails } from './meal.utils';
import { IngredientService } from '../ingredient/ingredient.service';
import { SearchQueryRepository } from '../../mongodb/repositories/search-query.repository';
import { MealCommentRepository } from '../../mongodb/repositories/meal-comment.repository';
import { CreateMealCommentBody, CreateMealRatingBody } from './meal.dto';
import { MealCommentDocument } from '../../mongodb/documents/meal-comment.document';
import { MealRatingRepository } from '../../mongodb/repositories/meal-rating.repository';
import { MealRatingDocument } from '../../mongodb/documents/meal-rating.document';
import { AxiosService } from '../../services/axios.service';

describe('MealService', () => {
    let mealService: MealService;
    let mealRepository: MealRepository;
    let mealCommentRepository: MealCommentRepository;
    let mealRatingRepository: MealRatingRepository;
    let searchQueryRepository: SearchQueryRepository;
    let redisService: RedisService;
    let ingredientService: IngredientService;
    let spoonacularApiService: SpoonacularApiService;
    let axiosService: AxiosService;

    const mockMealService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn(),
        replaceOne: jest.fn(),
        deleteOne: jest.fn(),
        calculateAverage: jest.fn(),
        getMeals: jest.fn()
    };

    const mockMealRatingRepository = {
        ...mockMealService,
        getAverageRatingForMeal: jest.fn(),
        updateAndReturnDocument: jest.fn()
    };

    const mockSpoonacularApiService = {
        getMeals: jest.fn(),
        getMealDetails: jest.fn()
    };

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn()
    };

    const mockRedisService = {
        get: jest.fn(),
        set: jest.fn(),
        unset: jest.fn(),
        hasMeal: jest.fn(),
        encodeKey: jest.fn(),
        getMealResult: jest.fn(),
        saveMealResult: jest.fn(),
        getMealDetails: jest.fn(),
        saveMealDetails: jest.fn()
    };

    const mockAxiosService = {
        get: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MealService,
                IngredientService,
                { provide: MealRepository, useValue: mockMealService },
                { provide: MealCommentRepository, useValue: mockMealService },
                { provide: MealRatingRepository, useValue: mockMealRatingRepository },
                { provide: SearchQueryRepository, useValue: mockMealService },
                { provide: JwtService, useClass: JwtService },
                { provide: JwtManagerService, useClass: JwtManagerService },
                { provide: LoggerService, useValue: mockLoggerService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: SpoonacularApiService, useValue: mockSpoonacularApiService },
                { provide: AxiosService, useValue: mockAxiosService }
            ],
        }).compile();

        mealService = module.get(MealService);
        mealRepository = module.get(MealRepository);
        mealCommentRepository = module.get(MealCommentRepository);
        mealRatingRepository = module.get(MealRatingRepository);
        searchQueryRepository = module.get(SearchQueryRepository);
        redisService = module.get(RedisService);
        ingredientService = module.get(IngredientService);
        spoonacularApiService = module.get(SpoonacularApiService);
        axiosService = module.get(AxiosService);
    });

    it('should be defined', () => {
        expect(mealService).toBeDefined();
        expect(mealRepository).toBeDefined();
        expect(mealCommentRepository).toBeDefined();
        expect(mealRatingRepository).toBeDefined();
        expect(searchQueryRepository).toBeDefined();
        expect(redisService).toBeDefined();
        expect(ingredientService).toBeDefined();
        expect(spoonacularApiService).toBeDefined();
        expect(axiosService).toBeDefined();
    });

    describe('create', () => {
        let mockMealDto;
        let mockMeal;
        let mockUserDto;

        beforeAll(() => {
            mockMealDto = {
                author: 'Author',
                description: 'Description of the meal',
                ingredients: ['xxx', 'yyy', 'zzz'],
                posted: new Date().getTime(),
                type: 'Meal type'
            };
            mockMeal = {
                ...mockMealDto,
                softAdded: true,
                _id: '123456789'
            };
            mockUserDto = {
                login: 'user'
            };
        });

        it('should create a new meal', async () => {
            const mockWrappedElements: any[] = ['xxx', 'yyy', 'zzz'];

            jest.spyOn(mealRepository, 'create').mockResolvedValue(mockMeal);
            jest.spyOn(ingredientService, 'wrapIngredientsWithImages').mockResolvedValue(mockWrappedElements);

            const result = await mealService.create(mockMealDto, mockUserDto);

            expect(result).toBe(mockMeal);
        });
    });

    describe('confirmCreating', () => {
        it('should confirm created meal and save to the cache', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softAdded: true
            } as any;
            const mockAddedMeal = {
                ...mockMeal,
                softAdded: undefined
            } as any;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockAddedMeal);

            const result = await mealService.confirmCreating(mockId, mockUser);

            expect(result).toBe(mockAddedMeal);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockAddedMeal, 'meal');
        });
    });

    describe('edit', () => {
        it('should edit a meal', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z']
            } as any;
            const editedMealDto = {
                description: 'Lorem ipsum 2',
                author: 'X',
                ingredients: [{
                    imageUrl: 'https://site.com/path',
                    name: 'X',
                    amount: 5,
                    unit: 'pieces'
                }]
            };
            const mockEditedMeal = {
                mockMeal,
                softEdited: editedMealDto
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockEditedMeal);

            const result = await mealService.edit(mockId, editedMealDto);

            expect(result).toBe(mockEditedMeal);
        });
    });

    describe('confirmEditing', () => {
        it('should confirm editing meal and update cache', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softEdited: {
                    description: 'Lorem ipsum 2'
                }
            } as any;
            const mockEditedMeal = {
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
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockEditedMeal);

            const result = await mealService.confirmEditing(mockId, mockUser);

            expect(result).toStrictEqual(mockEditedMeal);
            expect(redisService.set).toHaveBeenCalled();
            expect(redisService.set).toHaveBeenCalledWith(mockEditedMeal, 'meal');
        });
    });

    describe('delete', () => {
        it('should soft delete a meal and remove from cache', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z']
            } as any;
            const mockDeletedMeal = {
                ...mockMeal,
                softDeleted: true
            } as any;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockDeletedMeal);

            const result = await mealService.delete(mockId);

            expect(result).toBe(mockDeletedMeal);
            expect(redisService.unset).toHaveBeenCalled();
            expect(redisService.unset).toHaveBeenCalledWith(mockMeal, 'meal');
        });
    });

    describe('confirmDeleting', () => {
        it('should confirm deleting meal', async () => {
            const mockId = 'xxx';
            const mockMeal = {
                _id: mockId,
                title: 'XXX',
                description: 'Lorem ipsum',
                author: 'X',
                ingredients: ['x', 'y', 'z'],
                softDeleted: true
            } as any;
            const mockDeletedMeal = null;
            const mockUser = {
                _id: 'uuu',
                login: 'user',
                password: 'xxx',
            } as UserDto;

            jest.spyOn(mongoose, 'isValidObjectId')
                .mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById')
                .mockReturnValueOnce(mockMeal)
                .mockReturnValueOnce(mockDeletedMeal);

            const result = await mealService.confirmDeleting(mockId, mockUser);

            expect(result).toBe(mockDeletedMeal);
        });
    });

    describe('getMeals', () => {
        it('should return cached query', async () => {
            const ings: IngredientName[] = [IngredientName.CARROT, IngredientName.TOMATO];
            const type: MealType = MealType.SOUP;
            const cachedResult: RatedMeal[] = [
                {
                    id: 'some-id',
                    ingredients: [],
                    missingCount: 1,
                    relevance: 50,
                    title: 'some-meal',
                    provider: 'yummy',
                    type: MealType.ANY
                }
            ];

            jest.spyOn(redisService, 'getMealResult').mockResolvedValue(cachedResult);

            const result = await mealService.getMeals(ings, type);

            expect(result).toBe(cachedResult);
        });

        it('should build new query from various APIs when cache is empty and save query', async () => {
            const ings: IngredientName[] = [IngredientName.CARROT, IngredientName.TOMATO];
            const type: MealType = MealType.SOUP;
            const cachedResult = null;
            const mockResult: RatedMeal[] = [
                {
                    id: 'some-id',
                    ingredients: [],
                    missingCount: 1,
                    relevance: 50,
                    title: 'some-meal',
                    provider: 'yummy',
                    type: MealType.ANY
                }
            ];

            jest.spyOn(redisService, 'getMealResult').mockResolvedValue(cachedResult);
            jest.spyOn(mealRepository, 'getMeals').mockResolvedValue([]);
            jest.spyOn(spoonacularApiService, 'getMeals').mockResolvedValue(mockResult);
            jest.spyOn(redisService, 'saveMealResult').mockResolvedValue();

            const result = await mealService.getMeals(ings, type);

            expect(result).toStrictEqual(mockResult);
            expect(redisService.saveMealResult).toHaveBeenCalled();
        });
    });

    describe('getMealDetails', () => {
        it('should throw an error when id is not provided', async () => {
            await expect(mealService.getMealDetails(null)).rejects.toThrow(BadRequestException);
        });

        it('should return a meal when found its in cache', async () => {
            const mockCachedMeal: any = {};
            const mockId = 'id';

            jest.spyOn(redisService, 'getMealDetails').mockResolvedValueOnce(mockCachedMeal);

            const result = await mealService.getMealDetails(mockId);

            expect(result).toStrictEqual(mockCachedMeal);
        });

        it('should return a meal when found its in local database and cache it', async () => {
            const mockMeal: any = {
                id: 'xyz',
                ingredients: [
                    { name: 'x', amount: 1, unit: 'y' }
                ]
            };
            const resultMeal = proceedMealDocumentToMealDetails(mockMeal);
            const mockId = '5cabe64dcf0d4447fa60f5e2';

            jest.spyOn(redisService, 'getMealDetails').mockResolvedValueOnce(null);
            jest.spyOn(mealRepository, 'findById').mockResolvedValueOnce(mockMeal);

            const result = await mealService.getMealDetails(mockId);

            expect(result).toStrictEqual(resultMeal);
            expect(redisService.saveMealDetails).toHaveBeenCalled();
        });

        it('should return a meal when found its in an external API and cache it', async () => {
            const mockMeal: any = {
                id: 'xyz',
                ingredients: [
                    { name: 'x', amount: 1, unit: 'y' }
                ]
            };
            const resultMeal = proceedMealDocumentToMealDetails(mockMeal);
            const mockId = '5cabe64dcf0d4447fa60f5e2';

            jest.spyOn(redisService, 'getMealDetails').mockResolvedValueOnce(null);
            jest.spyOn(mealRepository, 'findById').mockResolvedValueOnce(null);
            jest.spyOn(spoonacularApiService, 'getMealDetails').mockResolvedValueOnce(resultMeal);

            const result = await mealService.getMealDetails(mockId);

            expect(result).toStrictEqual(resultMeal);
            expect(redisService.saveMealDetails).toHaveBeenCalled();
        });

        it('should throw an error when meal with provided id hasn\'t found', async () => {
            const mockId = '5cabe64dcf0d4447fa60f5e2';

            jest.spyOn(redisService, 'getMealDetails').mockResolvedValueOnce(null);
            jest.spyOn(mealRepository, 'findById').mockResolvedValueOnce(null);
            jest.spyOn(spoonacularApiService, 'getMealDetails').mockResolvedValueOnce(null);

            await expect(mealService.getMealDetails(mockId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('find', () => {
        it('should throw an error when provided invalid MongoDB id', async () => {
            const mockInvalidId = 'invalid id';
            const mockIsValidObjectId = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(false);

            await expect(mealService.find(mockInvalidId)).rejects.toThrow(BadRequestException);
            expect(mockIsValidObjectId).toHaveBeenCalledWith(mockInvalidId);
        });

        it('should throw an error when meal with provided id not found', async () => {
            const mockId = '64e9f765d4e60ba693641aa1';
            const mockFilter = {
                _id: mockId,
                softAdded: { $exists: false },
                softDeleted: { $exists: false }
            };
            const mockCachedMeal = null;
            jest.spyOn(redisService, 'get').mockReturnValueOnce(mockCachedMeal);
            jest.spyOn(mealRepository, 'findOne').mockReturnValueOnce(null);

            await expect(mealService.find(mockId)).rejects.toThrow(NotFoundException);
            expect(redisService.get).toHaveBeenCalled();
            expect(redisService.get).toReturnWith(mockCachedMeal);
            expect(mealRepository.findOne).toHaveBeenCalledWith(mockFilter);
        });

        it('should find a specific meal when cache is empty and save to the cache', async () => {
            const mockId = '64e9f765d4e60ba693641aa1';
            const mockCachedMeal = null;
            const mockMeal = {
                _id: mockId,
                name: 'Meal name'
            } as any;
            const mockFilter = {
                _id: mockId,
                softAdded: { $exists: false },
                softDeleted: { $exists: false }
            };
            jest.spyOn(redisService, 'get').mockReturnValueOnce(mockCachedMeal);
            jest.spyOn(mealRepository, 'findOne').mockReturnValueOnce(mockMeal);

            const result = await mealService.find(mockId);

            expect(result).toBe(mockMeal);
            expect(redisService.get).toHaveBeenCalled();
            expect(redisService.get).toReturnWith(mockCachedMeal);
            expect(mealRepository.findOne).toHaveBeenCalledWith(mockFilter);
            expect(redisService.set).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should find all meals', async () => {
            const mockMeals = [
                { name: 'Meal 1' },
                { name: 'Meal 2' }
            ] as any[];
            jest.spyOn(mealRepository, 'findAll').mockResolvedValue(mockMeals);

            const result = await mealService.findAll();

            expect(result).toBe(mockMeals);
        });
    });

    describe('getMealProposal', () => {
        it('should get received meals from all integrated APIs', async () => {
            const user: any = { login: 'login', expirationTimestamp: new Date(Date.now() + 50000) };
            const mockSearchQueries: any = [
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot', 'garlic'] },
                { login: 'login', date: new Date(), ingredients: ['carrot'] },
                { login: 'login', date: new Date(), ingredients: ['carrot'] },
                { login: 'login', date: new Date(), ingredients: ['onion'] }
            ];
            const mockMeals: any = [
                { id: '1', title: 'title1', ingredients: ['carrot', 'fish', 'garlic'], provider: 'yummy', type: MealType.ANY },
                { id: '2', title: 'title2', ingredients: ['carrot', 'fish'], provider: 'yummy', type: MealType.ANY }
            ];
            const mockMealResult: any = [
                { id: '1', title: 'title1', ingredients: ['carrot', 'fish', 'garlic'], recommendationPoints: 8, provider: 'yummy', type: MealType.ANY },
                { id: '2', title: 'title2', ingredients: ['carrot', 'fish'], recommendationPoints: 5, provider: 'yummy', type: MealType.ANY }
            ];

            jest.spyOn(searchQueryRepository, 'findAll').mockResolvedValueOnce(mockSearchQueries);
            jest.spyOn(spoonacularApiService, 'getMeals').mockResolvedValueOnce(mockMeals);

            const result = await mealService.getMealProposal(user);

            expect(result).toStrictEqual(mockMealResult);
        });
    });

    describe('addMealProposal', () => {
        it('should add a new record with provided ingredients', async () => {
            const user: any = { id: '1' };
            const ingredients: any = ['carrot', 'apple', 'fish'];

            jest.spyOn(ingredientService, 'filterIngredients').mockReturnValueOnce(ingredients);

            await mealService.addMealProposal(user, ingredients);

            expect(ingredientService.filterIngredients).toHaveBeenCalledWith(ingredients);
            expect(searchQueryRepository.create).toHaveBeenCalled();
        });
    });

    describe('hasMeal', () => {
        it('should return true when meal is cached', async () => {
            const mockMealId = 'mock meal id';

            jest.spyOn(redisService, 'hasMeal').mockResolvedValueOnce(true);

            const hasMeal = await mealService.hasMeal(mockMealId);

            expect(hasMeal).toBeTruthy();
        });

        it('should return true when is not cached but is in mongo', async () => {
            const mockMealId = 'mock meal id';
            const mockMeal: any = { _id: mockMealId };

            jest.spyOn(redisService, 'hasMeal').mockResolvedValueOnce(false);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById').mockResolvedValueOnce(mockMeal);

            const hasMeal = await mealService.hasMeal(mockMealId);

            expect(hasMeal).toBeTruthy();
        });

        it('should return true when is not cached but is in external database', async () => {
            const mockMealId = 'mock meal id';
            const mockMeal: any = { _id: mockMealId };

            jest.spyOn(redisService, 'hasMeal').mockResolvedValueOnce(false);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(false);
            jest.spyOn(spoonacularApiService, 'getMealDetails').mockResolvedValueOnce(mockMeal);

            const hasMeal = await mealService.hasMeal(mockMealId);

            expect(hasMeal).toBeTruthy();
        });

        it('should return false when does not exist', async () => {
            const mockMealId = 'mock meal id';

            jest.spyOn(redisService, 'hasMeal').mockResolvedValueOnce(false);
            jest.spyOn(mongoose, 'isValidObjectId').mockReturnValueOnce(true);
            jest.spyOn(mealRepository, 'findById').mockResolvedValueOnce(null);

            const hasMeal = await mealService.hasMeal(mockMealId);

            expect(hasMeal).toBeFalsy();
        });
    });

    describe('getComments', () => {
        it('should return all comments for a particular meal', async () => {
            const mockMealId = 'mock meal id';
            const mockMealComments: any[] = [
                {
                    mealId: mockMealId,
                    user: 'mock user name',
                    text: 'That\'s an awesome meal ever!',
                    posted: Date.now()
                }
            ];

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(true);
            jest.spyOn(mealCommentRepository, 'findAll').mockResolvedValueOnce(mockMealComments);

            const mealComments = await mealService.getComments(mockMealId);

            expect(mealComments).toHaveLength(1);
            expect(mealComments[0]).toStrictEqual(mockMealComments[0]);
        });

        it('should throw an error when meal with provided ID does not exist', async () => {
            const mockMealId = 'mock meal id';

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(false);

            await expect(mealService.getComments(mockMealId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('addComment', () => {
        it('should add a new comment for a particular meal', async () => {
            const createMealCommentDto: CreateMealCommentBody = {
                mealId: 'mock meal id',
                text: 'That\'s an awesome meal ever!'
            };
            const mockMealComment = {
                ...createMealCommentDto,
                posted: Date.now()
            } as MealCommentDocument;

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(true);
            jest.spyOn(mealCommentRepository, 'create').mockResolvedValueOnce(mockMealComment);

            const result = await mealService.addComment(createMealCommentDto, 'user name');

            expect(result).toBeUndefined();
        });

        it('should throw an error when meal with provided ID does not exist', async () => {
            const createMealCommentDto: CreateMealCommentBody = {
                mealId: 'mock meal id',
                text: 'That\'s an awesome meal ever!'
            };

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(false);

            await expect(mealService.addComment(createMealCommentDto, 'user name')).rejects.toThrow(NotFoundException);
        });
    });

    describe('calculateRating', () => {
        it('should return rating for meal', async () => {
            const mockMealId = 'mock meal id';
            const mockMealRating: MealRating = {
                mealId: mockMealId,
                rating: 7.44,
                count: 712
            };

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(true);
            jest.spyOn(mealRatingRepository, 'getAverageRatingForMeal').mockResolvedValueOnce(mockMealRating);

            const mealRating = await mealService.calculateRating(mockMealId);

            expect(mealRating).toStrictEqual(mockMealRating);
        });

        it('should throw an error when meal with provided ID does not exist', async () => {
            const mockMealId = 'mock meal id';

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(false);

            await expect(mealService.calculateRating(mockMealId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('addRating', () => {
        it('should add a new rating for a specific meal', async () => {
            const createMealRatingDto: CreateMealRatingBody = {
                mealId: 'mock meal id',
                rating: 7
            };
            const mockMealRating = {
                ...createMealRatingDto,
                posted: Date.now()
            } as MealRatingDocument;

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(true);
            jest.spyOn(mealRatingRepository, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(mealRatingRepository, 'create').mockResolvedValueOnce(mockMealRating);

            const rating = await mealService.addRating(createMealRatingDto, 'user name');

            expect(rating).toStrictEqual(mockMealRating);
        });

        it('should change a rating when rating exists', async () => {
            const createMealRatingDto: CreateMealRatingBody = {
                mealId: 'mock meal id',
                rating: 10
            };
            const mockExistingRating = {
                _id: 'abc',
                mealId: 'mock meal id',
                user: 'mock user name',
                rating: 7,
                posted: Date.now() - 5000
            } as MealRatingDocument;
            const mockMealRating = {
                ...createMealRatingDto,
                posted: Date.now()
            } as any;

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(true);
            jest.spyOn(mealRatingRepository, 'findOne').mockResolvedValueOnce(mockExistingRating);
            jest.spyOn(mealRatingRepository, 'updateAndReturnDocument').mockResolvedValueOnce(mockMealRating);
            jest.spyOn(mealRatingRepository, 'create').mockResolvedValueOnce(mockMealRating);

            const rating = await mealService.addRating(createMealRatingDto, 'user name');

            expect(rating).toStrictEqual(mockMealRating);
            expect(rating.rating).toEqual(mockMealRating.rating);
            expect(mealRatingRepository.updateAndReturnDocument).toHaveBeenCalled();
        });

        it('should throw an error when meal with provided ID does not exist', async () => {
            const createMealRatingDto: CreateMealRatingBody = {
                mealId: 'mock meal id',
                rating: 7
            };

            jest.spyOn(mealService, 'hasMeal').mockResolvedValueOnce(false);

            await expect(mealService.addRating(createMealRatingDto, 'user name')).rejects.toThrow(NotFoundException);
        });
    });
});
