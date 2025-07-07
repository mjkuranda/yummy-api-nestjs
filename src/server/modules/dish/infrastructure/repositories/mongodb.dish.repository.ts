import { DishRepository } from '../../domain/dish.repository';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { DishDocument } from '../../../../../infrastructure/databases/mongodb/documents';
import { dishModel } from '../../../../common/definitions/mongoose-model.definitions';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDishDataType, DishId } from '../../dish.types';
import { DishEntity } from '../../domain/common/entities';
import { DishFactory } from '../../domain/common/factories';
import { InvalidMongooseIdTypeError, InvalidMongooseObjectIdError } from '../../../../common/errors';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { MealType, Provider } from '../../../../common/enums';
import { EditDishDto } from '../../application/dtos';
import { calculateMissing, calculateRelevance } from '../../../../common/helpers';
import { DishResultValueObject } from '../../domain/read/value-objects';
import { Injectable } from '@nestjs/common';
import { DishOverviewValueObject } from 'src/server/modules/user/domain/value-objects';

@Injectable()
export class MongodbDishRepository implements DishRepository {

    constructor(
        @InjectModel(dishModel.name) private readonly model: Model<DishDocument>
    ) {}

    async findByDishId(id: DishId): Promise<DishEntity | null> {
        if (typeof id !== 'string') {
            throw new InvalidMongooseIdTypeError(id);
        }

        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        const document = await this.model.findById(id);

        if (!document) {
            return null;
        }

        return DishFactory.fromDocument(document);
    }

    async createNewDish(data: CreateDishDataType, author?: string, ingredients?: DishIngredient[]): Promise<DishEntity> {
        const doc = await this.model.create({
            ...data,
            ingredients,
            author,
            posted: Date.now(),
            provider: Provider.INT_DMT_USER,
            softAdded: true
        });

        return DishFactory.fromDocument(doc);
    }

    async getDishesWithSoftAdded(): Promise<DishEntity[]> {
        const docs = await this.findAll({ softAdded: { $eq: true }});

        return DishFactory.fromDocuments(docs);
    }

    async getDishesWithSoftEdited(): Promise<DishEntity[]> {
        const docs = await this.findAll({ softEdited: { $exists: true }});

        return DishFactory.fromDocuments(docs);
    }

    async getDishesWithSoftDeleted(): Promise<DishEntity[]> {
        const docs = await this.findAll({ softDeleted: { $eq: true }});

        return DishFactory.fromDocuments(docs);
    }

    async findOneAvailableDish(id: DishId): Promise<DishEntity | null> {
        const doc = await this.model.findOne({
            _id: id,
            softAdded: { $exists: false },
            softDeleted: { $exists: false }
        });

        if (!doc) {
            return null;
        }

        return DishFactory.fromDocument(doc);
    }

    async unsetSoftAddedForDish(id: DishId): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $unset: {
                softAdded: true
            }
        });
    }

    async insertEditionForDish(id: DishId, editDishDto: EditDishDto<DishIngredient>): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $set: {
                softEdited: editDishDto
            }
        });
    }

    async confirmDishEdition(id: DishId, dishSoftEdited?: DishEntity): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $unset: { softEdited: {}},
            $set: { ...dishSoftEdited }
        });
    }

    async setSoftDeletedForDish(id: string): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $set: {
                softDeleted: true
            }
        });
    }

    async deleteDish(id: string): Promise<void> {
        await this.model.deleteOne({ _id: id });
    }

    getProvider(): Provider {
        return Provider.INT_DMT_USER;
    }

    async findDishesByIngredientsAndType(ingredients: string[], mealType?: MealType): Promise<DishResultValueObject[]> {
        const dishes = await this.findAll({
            'ingredients.name': { $in: ingredients },
            $or: [
                { softAdded: { $exists: false }},
                { softAdded: false }
            ],
            ...( mealType && { mealType })
        });

        return dishes.map(dish => {
            const dishEntity = DishFactory.fromDocument(dish);
            const dishIngredients = dish.ingredients;
            const finalDishIngredients = dishIngredients.map(ingredient => ingredient.name);
            const relevance = calculateRelevance(ingredients, finalDishIngredients);
            const missingCount = calculateMissing(ingredients, finalDishIngredients);

            return DishResultValueObject.fromDishEntity(dishEntity, relevance, missingCount);
        });
    }

    async findDishesByAuthor(userLogin: string): Promise<DishOverviewValueObject[]> {
        const dishes = await this.model.find({ author: userLogin });

        return DishOverviewValueObject.fromDocuments(dishes);
    }

    private async findAll(filterQuery: FilterQuery<DishDocument>, limit?: number): Promise<DishDocument[] | null> {
        if (limit) {
            return this.model.find(filterQuery).limit(limit);
        }

        return this.model.find(filterQuery);
    }
}