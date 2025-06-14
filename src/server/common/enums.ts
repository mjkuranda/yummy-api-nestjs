import { IngredientUnitConverter, Language } from './types';

export const LanguageName: Record<Language, string> = {
    en: 'English',
    'en-US': 'American English',
    pl: 'Polish'
};

export enum Provider {
    INT_DMT_USER = 'int_dmt_user',                  // NOTE: DishMatcher user
    EXT_API_SPOONACULAR = 'ext_api_spoonacular'     // NOTE: External API - Spoonacular
}

export enum Repository {
    DISH_REPOSITORY = 'dish_repository',
    DISH_COMMENT_REPOSITORY = 'dish_comment_repository',
    DISH_RATING_REPOSITORY = 'dish_rating_repository',
    RECIPE_REPOSITORY = 'recipe_repository',
    USER_ACTION_REPOSITORY = 'user_action_repository',
    USER_SEARCH_QUERY_REPOSITORY = 'user_search_query_repository'
}

export enum MealType {
    ANY = 'any',
    BREAKFAST = 'breakfast',
    LAUNCH = 'launch',
    DINNER = 'dinner'
}

export enum DishType {
    ANY = 'any',
    SOUP = 'soup',
    MAIN_COURSE = 'main course',
    SALAD = 'salad',
    DESSERT = 'dessert',
    BEVERAGE = 'beverage'
}

export const SoupTypes = ['soup'] as const;

export const MainCourseTypes = ['main course', 'stew', 'grilled', 'stewed', 'fried', 'pasta with'] as const;

export const SaladTypes = ['salad'] as const;

export const DessertTypes = ['dessert', 'cake', 'pie', 'pudding'] as const;

export const BeverageTypes = ['beverage', 'smoothie', 'mojito', 'pina colada', 'juice', 'tea', 'chai', 'coffee'] as const;

export enum IngredientName {
    BLUEBERRY = 'blueberry',
    CHERRY = 'cherry',
    GRAPE = 'grape',
    RASPBERRY = 'raspberry',
    STRAWBERRY = 'strawberry',

    LEMON = 'lemon',
    ORANGE = 'orange',
    APPLE = 'apple',

    FISH = 'fish',

    BROCCOLI = 'broccoli',
    CARROT = 'carrot',
    CAULIFLOWER = 'cauliflower',
    CELERY = 'celery',
    KOHLRABI = 'kohlrabi',
    LEEK = 'leek',
    PUMPKIN = 'pumpkin',
    TOMATO = 'tomato',
    WHITE_BEANS = 'white beans',
    ZUCCHINI = 'zucchini'
}

// https://en.wikipedia.org/wiki/Ounce
const OunceUnitConverter: IngredientUnitConverter = {
    multiplier: 28.349523125, // The international yard and pound agreement
    targetUnit: 'g',
    targetUnitBorder: 1000,
    superiorUnit: 'kg'
} as const;

// https://en.wikipedia.org/wiki/Pound_(mass)
const PoundUnitConverter: IngredientUnitConverter = {
    multiplier: 453, // SI
    targetUnit: 'g',
    targetUnitBorder: 1000,
    superiorUnit: 'kg'
} as const;

// https://en.wikipedia.org/wiki/Pint
const PintUnitConverter: IngredientUnitConverter = {
    multiplier: 568.261, // SI (imperial)
    targetUnit: 'ml',
    targetUnitBorder: 1000,
    superiorUnit: 'l'
} as const;

// https://en.wikipedia.org/wiki/Quart
const QuartUnitConverter: IngredientUnitConverter = {
    multiplier: 1.13652, // SI
    targetUnit: 'l',
    targetUnitBorder: 100,
    superiorUnit: 'hl'
} as const;

// https://en.wikipedia.org/wiki/Gallon
const GallonUnitConverter: IngredientUnitConverter = {
    multiplier: 4.54609, // SI
    targetUnit: 'l',
    targetUnitBorder: 100,
    superiorUnit: 'hl'
} as const;

// https://en.wikipedia.org/wiki/Fluid_ounce
const FluidOunceUnitConverter: IngredientUnitConverter = {
    multiplier: 28.41306, // SI
    targetUnit: 'ml',
    targetUnitBorder: 1000,
    superiorUnit: 'l'
} as const;

export const IngredientUnitConverters: Record<string, IngredientUnitConverter> = {
    'ounces': OunceUnitConverter,
    'ounce': OunceUnitConverter,
    'oz': OunceUnitConverter,
    'pounds': PoundUnitConverter,
    'pound': PoundUnitConverter,
    'lb': PoundUnitConverter,
    'pints': PintUnitConverter,
    'pint': PintUnitConverter,
    'pt': PintUnitConverter,
    'quarts': QuartUnitConverter,
    'quart': QuartUnitConverter,
    'qt': QuartUnitConverter,
    'gallons': GallonUnitConverter,
    'gallon': GallonUnitConverter,
    'gal': GallonUnitConverter,
    'fluid ounces': FluidOunceUnitConverter,
    'fluid ounce': FluidOunceUnitConverter,
    'fl oz': FluidOunceUnitConverter
};