import { DishEntity } from './common/entities';
import { DishId } from '../dish.types';
import { DishIngredient } from '../../ingredient/ingredient.types';
import { EditDishDto } from '../application/dtos';
import { MealType } from '../../../common/enums';
import { DishResultVo } from './read/vos';
import { DishOverviewVo } from '../../user/domain/vos';
import { CreateDishVo } from './write/vos';

export interface DishRepository {
    createNewDish: (data: CreateDishVo, author?: string, ingredients?: DishIngredient[]) => Promise<DishEntity>;
    findByDishId: (id: DishId) => Promise<DishEntity | null>;
    getDishesWithSoftAdded: () => Promise<DishEntity[]>;
    getDishesWithSoftEdited: () => Promise<DishEntity[]>;
    getDishesWithSoftDeleted: () => Promise<DishEntity[]>;
    findOneAvailableDish: (id: DishId) => Promise<DishEntity | null>;
    unsetSoftAddedForDish: (id: DishId) => Promise<void>;
    insertEditionForDish: (id: DishId, editDishDto: EditDishDto<DishIngredient>) => Promise<void>;
    confirmDishEdition: (id: DishId, dishSoftEdited?: DishEntity) => Promise<void>;
    setSoftDeletedForDish: (id: DishId) => Promise<void>;
    deleteDish: (id: DishId) => Promise<void>;
    findDishesByIngredientsAndType: (ingredients: string[], mealType?: MealType) => Promise<DishResultVo[]>;
    findDishesByAuthor: (userLogin: string) => Promise<DishOverviewVo[]>;
}