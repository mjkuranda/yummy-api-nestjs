import { Provider } from '../../../../../../common/enums';
import { EncodedDishIdVo } from '../../../common/vos';
import { DishResultVo, DishDetailsVo, DishCommentVo, DishRatingVo } from '../../vos';
import { DishEntity } from '../../../common/entities';
import { MealType } from '../../../../../../common/enums';

// EncodedDishIdVo fixtures
export const encodedDishIdVoFixture = new EncodedDishIdVo('encoded-token-123', Provider.INT_DMT_USER, '123');
export const encodedDishIdVoFixture2 = new EncodedDishIdVo('encoded-token-456', Provider.INT_DMT_USER, '456');

// DishResultVo fixtures
export const dishResultVoFixture: DishResultVo = {
    relevance: 0.8,
    mealType: MealType.LAUNCH,
    id: '123',
    name: 'Test Dish',
    image: 'test-image.jpg',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: ['step1', 'step2'],
    prepTime: 30,
    cookTime: 45,
    servings: 4,
    difficulty: 'medium',
    cuisine: 'italian',
    tags: ['tag1', 'tag2'],
    nutrition: {
        calories: 500,
        protein: 25,
        carbs: 60,
        fat: 20
    }
} as any;

export const dishResultVoFixture2: DishResultVo = {
    relevance: 0.6,
    mealType: MealType.BREAKFAST,
    id: '456',
    name: 'Test Dish 2',
    image: 'test-image-2.jpg',
    ingredients: ['ingredient3', 'ingredient4'],
    instructions: ['step3', 'step4'],
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: 'easy',
    cuisine: 'american',
    tags: ['tag3', 'tag4'],
    nutrition: {
        calories: 300,
        protein: 15,
        carbs: 40,
        fat: 10
    }
} as any;

// DishDetailsVo fixtures
export const dishDetailsVoFixture: DishDetailsVo = {
    id: '123',
    name: 'Test Dish Details',
    image: 'test-image-details.jpg',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: ['step1', 'step2'],
    prepTime: 30,
    cookTime: 45,
    servings: 4,
    difficulty: 'medium',
    cuisine: 'italian',
    tags: ['tag1', 'tag2'],
    nutrition: {
        calories: 500,
        protein: 25,
        carbs: 60,
        fat: 20
    },
    softAdded: false,
    softDeleted: false,
    softEdited: false
} as any;

export const softAddedDishDetailsVoFixture: DishDetailsVo = {
    ...dishDetailsVoFixture,
    softAdded: true
} as any;

export const softDeletedDishDetailsVoFixture: DishDetailsVo = {
    ...dishDetailsVoFixture,
    softDeleted: true
} as any;

export const softEditedDishDetailsVoFixture: DishDetailsVo = {
    ...dishDetailsVoFixture,
    softEdited: true
} as any;

// DishEntity fixtures
export const dishEntityFixture: DishEntity = {
    id: '123',
    name: 'Test Dish Entity',
    image: 'test-image-entity.jpg',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: ['step1', 'step2'],
    prepTime: 30,
    cookTime: 45,
    servings: 4,
    difficulty: 'medium',
    cuisine: 'italian',
    tags: ['tag1', 'tag2'],
    nutrition: {
        calories: 500,
        protein: 25,
        carbs: 60,
        fat: 20
    },
    softAdded: false,
    softDeleted: false,
    softEdited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    getAuthor: () => 'testuser'
} as any;

// DishCommentVo fixtures
export const dishCommentVoFixture: DishCommentVo = {
    id: 'comment-123',
    content: 'Great dish!',
    author: 'user1',
    createdAt: new Date(),
    dishId: '123',
    getText: () => 'Great dish!',
    getPostedTime: () => new Date()
} as any;

export const dishCommentVoFixture2: DishCommentVo = {
    id: 'comment-456',
    content: 'Amazing recipe!',
    author: 'user2',
    createdAt: new Date(),
    dishId: '123',
    getText: () => 'Amazing recipe!',
    getPostedTime: () => new Date()
} as any;

// DishRatingVo fixtures
export const dishRatingVoFixture: DishRatingVo = {
    averageRating: 4.5,
    ratingCount: 10,
    dish: dishEntityFixture
} as any;

// Search query fixtures
export const userSearchQueryEntitiesFixture = [
    {
        ingredients: ['apple', 'banana'],
        createdAt: new Date()
    },
    {
        ingredients: ['carrot', 'potato'],
        createdAt: new Date()
    }
] as any;

// Input fixtures
export const providedIngredientsFixture = ['apple', 'carrot'];
export const mergedIngredientsFixture = ['apple', 'banana', 'carrot', 'potato'];
export const mealTypeFixture = MealType.LAUNCH;
export const userLoginFixture = 'testuser';