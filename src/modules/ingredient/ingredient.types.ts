export type IngredientDataset = Map<string, IngredientData>;

export interface IngredientData {
    en: string;
    pl: string;
    id?: number;
    imageUrl?: string;
}

export interface MealIngredient {
    amount: number;
    imageUrl: string;
    name: IngredientType;
    unit: string;
}

export type MealIngredientWithoutImage = Omit<MealIngredient, 'imageUrl'> & { id: number };

export type IngredientCategory = 'breads' | 'dairy-and-eggs' | 'fish-and-seafood' | 'fruits' | 'meats' | 'oils-and-fats' | 'pasta' | 'seeds-and-nuts' | 'spices' | 'vegetables';

export type IngredientDataObject = Record<IngredientCategory, IngredientType[]>;

export type IngredientType = string;