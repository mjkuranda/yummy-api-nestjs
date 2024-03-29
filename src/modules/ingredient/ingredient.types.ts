import { IngredientUnit } from '../../common/enums';

export interface IngredientDataset {
    category: IngredientCategory;
    data: IngredientType[];
}

export interface MealIngredient {
    amount: number;
    imageUrl: string;
    name: IngredientType;
    unit: IngredientUnit;
}

export type IngredientCategory = 'breads' | 'dairy-and-eggs' | 'fish-and-seafood' | 'fruits' | 'meats' | 'oils-and-fats' | 'pasta' | 'seeds-and-nuts' | 'spices' | 'vegetables';

export type IngredientDataObject = Record<IngredientCategory, IngredientType[]>;

export type IngredientType = string;