export type IngredientDataset = Map<string, IngredientData>;

export interface IngredientData {
    en: string;
    pl: string;
    id?: number;
    imageUrl?: string;
}

export interface DishIngredient {
    amount: number;
    imageUrl: string;
    name: IngredientType;
    unit: string;
}

export type DishIngredientWithoutImage = Omit<DishIngredient, 'imageUrl'> & { id: number };

export type IngredientCategory = 'breads' | 'cereal-products' | 'dairy-and-eggs' | 'fish-and-seafood' | 'fruits' | 'meats' | 'mushrooms' | 'oils-and-fats' | 'pasta' | 'seeds-and-nuts' | 'spices' | 'vegetables';

export type IngredientDataObject = Record<IngredientCategory, IngredientType[]>;

export type IngredientType = string;