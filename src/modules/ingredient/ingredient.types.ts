export type IngredientDataset = Map<string, {
    en: string,
    pl: string
}>;

export interface MealIngredient {
    amount: number;
    imageUrl: string;
    name: IngredientType;
    unit: string;
}

export type IngredientCategory = 'breads' | 'dairy-and-eggs' | 'fish-and-seafood' | 'fruits' | 'meats' | 'oils-and-fats' | 'pasta' | 'seeds-and-nuts' | 'spices' | 'vegetables';

export type IngredientDataObject = Record<IngredientCategory, IngredientType[]>;

export type IngredientType = string;