import { CreateDishVo, EditDishVo } from '../../vos';
import { DishType, MealType, Provider } from '../../../../../../common/enums';
import { DishIngredient } from '../../../../../ingredient/ingredient.types';
import { DishEntity } from '../../../common/entities';
import { EncodedDishIdVo } from '../../../common/vos';

export const createDishVoFixture = CreateDishVo.fromCreateDishDto({
    description: 'description',
    imageUrl: 'image-url',
    ingredients: [],
    language: 'en',
    readyInMinutes: 1,
    title: 'Untitled',
    dishType: DishType.ANY,
    mealType: MealType.ANY,
    get ingredientCount(): number {
        return 0;
    }
});

export const createDishVoWithIngredientsFixture = CreateDishVo.fromCreateDishDto({
    description: 'description',
    imageUrl: 'image-url',
    ingredients: [
        { id: 1, name: 'fake', amount: 1, unit: 'spoon' },
        { id: 100, name: 'fake grams', amount: 100, unit: 'g' }
    ],
    language: 'en',
    readyInMinutes: 1,
    title: 'Untitled2',
    dishType: DishType.ANY,
    mealType: MealType.ANY,
    get ingredientCount(): number {
        return 2;
    }
});

export const wrappedIngredientsWithImagesFixture: DishIngredient[] = [
    { name: 'fake', amount: 1, unit: 'spoon', imageUrl: 'abc' },
    { name: 'fake grams', amount: 100, unit: 'g', imageUrl: 'abc2' }
];

export const createdDishResultFixture: DishEntity = { test: 'abc' } as any;

export const dishEntityToEditFixture: DishEntity = { title: 'title' } as any;
export const editedDishEntityFixture: DishEntity = new DishEntity({
    title: 'title',
    softEdited: new DishEntity({ title: 'new title' } as any)
} as any) as any;
export const softDeletedDishEntityFixture: DishEntity = new DishEntity({ softDeleted: true } as any);
export const dishEntityToDeleteFixture: DishEntity = new DishEntity({ title: 'title' } as any);
export const deletedDishEntityFixture: DishEntity = new DishEntity({
    title: 'title',
    softDeleted: true
} as any);

export const dishIdFixture = '123';
export const encodedDishIdVoFixture: EncodedDishIdVo = new EncodedDishIdVo('encoded', Provider.INT_DMT_USER, dishIdFixture);

export const editDishVoFixture: EditDishVo = EditDishVo.fromEditDishDto({ title: 'new title' });