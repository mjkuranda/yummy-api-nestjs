import { IngredientUnitConverter } from './types';

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

export const IngredientUnitConverters: Record<string, IngredientUnitConverter> = {
    // https://en.wikipedia.org/wiki/Ounce
    'ounces': {
        multiplier: 28.349523125, // The international yard and pound agreement
        targetUnit: 'g',
        targetUnitBorder: 1000,
        superiorUnit: 'kg'
    },
    'oz': {
        multiplier: 28.349523125, // The international yard and pound agreement
        targetUnit: 'g',
        targetUnitBorder: 1000,
        superiorUnit: 'kg'
    },
    // https://en.wikipedia.org/wiki/Pound_(mass)
    'pounds': {
        multiplier: 453, // SI
        targetUnit: 'g',
        targetUnitBorder: 1000,
        superiorUnit: 'kg'
    },
    'lb': {
        multiplier: 453, // SI
        targetUnit: 'g',
        targetUnitBorder: 1000,
        superiorUnit: 'kg'
    },
    // https://en.wikipedia.org/wiki/Pint
    'pints': {
        multiplier: 568.261, // SI (imperial)
        targetUnit: 'ml',
        targetUnitBorder: 1000,
        superiorUnit: 'l'
    },
    'pt': {
        multiplier: 568.261, // SI (imperial)
        targetUnit: 'ml',
        targetUnitBorder: 1000,
        superiorUnit: 'l'
    },
    // https://en.wikipedia.org/wiki/Quart
    'quarts': {
        multiplier: 1.13652, // SI
        targetUnit: 'l',
        targetUnitBorder: 100,
        superiorUnit: 'hl'
    },
    'qt': {
        multiplier: 1.13652, // SI
        targetUnit: 'l',
        targetUnitBorder: 100,
        superiorUnit: 'hl'
    },
    // https://en.wikipedia.org/wiki/Gallon
    'gallons': {
        multiplier: 4.54609, // SI
        targetUnit: 'l',
        targetUnitBorder: 100,
        superiorUnit: 'hl'
    },
    'gal': {
        multiplier: 4.54609, // SI
        targetUnit: 'l',
        targetUnitBorder: 100,
        superiorUnit: 'hl'
    },
    // https://en.wikipedia.org/wiki/Fluid_ounce
    'fluid ounces':{
        multiplier: 28.41306, // SI
        targetUnit: 'ml',
        targetUnitBorder: 1000,
        superiorUnit: 'l'
    },
    'fl oz': {
        multiplier: 28.41306, // SI
        targetUnit: 'ml',
        targetUnitBorder: 1000,
        superiorUnit: 'l'
    }
};