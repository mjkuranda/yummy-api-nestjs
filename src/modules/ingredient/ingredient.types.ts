export interface IngredientDataset {
    category: IngredientCategory,
    data: IngredientType[]
}

export type IngredientCategory = 'breads' | 'dairy-and-eggs' | 'fish-and-seafood' | 'fruits' | 'meats' | 'oils-and-fats' | 'pasta' | 'seeds-and-nuts' | 'spices' | 'vegetables';

export type IngredientDataObject = Record<IngredientCategory, IngredientType[]>;

type IngredientType = string;