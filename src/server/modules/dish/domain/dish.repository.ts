import { Injectable } from '@nestjs/common';
import { DishEntity } from './common/entities';
import { CreateDishDataType, DishId } from '../dish.types';
import { DishIngredient } from '../../ingredient/ingredient.types';
import { DishEditDto } from '../dish.dto';
import { MealType } from '../../../common/enums';
import { DishResultValueObject } from './read/value-objects';
import { DishOverviewValueObject } from '../../user/domain/value-objects';

@Injectable()
export class DishRepository {
    create: (data: CreateDishDataType, author?: string, ingredients?: DishIngredient[]) => Promise<DishEntity>;
    findById: (id: DishId) => Promise<DishEntity | null>;
    getDishesWithSoftAdded: () => Promise<DishEntity[]>;
    getDishesWithSoftEdited: () => Promise<DishEntity[]>;
    getDishesWithSoftDeleted: () => Promise<DishEntity[]>;
    findOneAvailable: (id: DishId) => Promise<DishEntity | null>;
    unsetSoftAdded: (id: DishId) => Promise<void>;
    insertEdition: (id: DishId, dishEditDto: DishEditDto<DishIngredient>) => Promise<void>;
    confirmEdition: (id: DishId, dishSoftEdited?: DishEntity) => Promise<void>;
    setSoftDeleted: (id: DishId) => Promise<void>;
    delete: (id: DishId) => Promise<void>;
    findByIngredientsAndType: (ingredients: string[], mealType?: MealType) => Promise<DishResultValueObject[]>;
    findByAuthor: (userLogin: string) => Promise<DishOverviewValueObject[]>;
}