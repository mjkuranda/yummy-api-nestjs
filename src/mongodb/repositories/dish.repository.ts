import { AbstractRepository } from './abstract.repository';
import { DishDocument } from '../documents/dish.document';
import { InjectModel } from '@nestjs/mongoose';
import { dishModel } from '../../common/definitions/mongoose-model.definitions';
import { isValidObjectId, Model } from 'mongoose';
import { DishEditDto } from '../../modules/dish/dish.dto';
import { DishIngredient } from '../../modules/ingredient/ingredient.types';
import { CreateDishDataType, RatedDish } from '../../modules/dish/dish.types';
import { calculateMissing, calculateRelevance } from '../../common/helpers';
import { DishProvidable } from '../../common/interfaces';
import { DishProvider, MealType } from '../../common/enums';
import { proceedDishDocumentToDishDetails } from '../../modules/dish/dish.utils';
import { EncodedDishId } from '../../common/types';
import { DishIdObfuscator } from '../../common/helpers/dish-id-obfuscator.helper';
import { InvalidMongooseObjectIdError } from '../../errors/infrastructure';
import { DishDetailsWithMetadata } from '../../modules/dish/read/dish-read.types';

export class DishRepository extends AbstractRepository<DishDocument, CreateDishDataType> implements DishProvidable {

    constructor(@InjectModel(dishModel.name) model: Model<DishDocument>) {
        super(model);
    }

    async create(data: CreateDishDataType, author?: string, ingredients?: DishIngredient[]) {
        return this.model.create({
            ...data,
            ingredients,
            author,
            posted: Date.now(),
            provider: DishProvider.INT_DMT_USER,
            softAdded: true
        });
    }

    async getDishDetails(encodedDishId: EncodedDishId): Promise<DishDetailsWithMetadata | null> {
        const { dishId: id } = DishIdObfuscator.decode(encodedDishId);

        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError('Dish not found, because ID is not valid ObjectId.');
        }

        const dishDocument: DishDocument = await this.model.findById(id);

        if (!dishDocument) {
            return null;
        }

        const dishDetails = proceedDishDocumentToDishDetails(dishDocument);

        return {
            dishDetails,
            metadata: {
                softAdded: dishDocument.softAdded,
                softDeleted: dishDocument.softDeleted
            }
        };
    }

    async getDishesWithSoftAdded(): Promise<DishDocument[]> {
        return await this.findAll({ softAdded: { $eq: true }});
    }

    async getDishesWithSoftEdited(): Promise<DishDocument[]> {
        return await this.findAll({ softEdited: { $exists: true }});
    }

    async getDishesWithSoftDeleted(): Promise<DishDocument[]> {
        return await this.findAll({ softDeleted: { $eq: true }});
    }

    async findOneAvailable(id: string): Promise<DishDocument | null> {
        return this.model.findOne({
            _id: id,
            softAdded: { $exists: false },
            softDeleted: { $exists: false }
        });
    }

    async unsetSoftAdded(id: string): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $unset: {
                softAdded: true
            }
        });
    }

    async insertEdition(id: string, dishEditDto: DishEditDto<DishIngredient>): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $set: {
                softEdited: dishEditDto
            }
        });
    }

    async confirmEdition(id: string, dishSoftEdited?: DishDocument): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $unset: { softEdited: {}},
            $set: { ...dishSoftEdited }
        });
    }

    async setSoftDeleted(id: string): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $set: {
                softDeleted: true
            }
        });
    }

    async delete(id: string): Promise<void> {
        await this.model.deleteOne({ _id: id });
    }

    getProvider(): DishProvider {
        return DishProvider.INT_DMT_USER;
    }

    async getDishes(ingredients: string[], mealType?: MealType): Promise<RatedDish[]> {
        const dishes = await this.findAll({
            'ingredients.name': { $in: ingredients },
            $or: [
                { softAdded: { $exists: false }},
                { softAdded: false }
            ],
            ...( mealType && { mealType })
        });

        return dishes.map(dish => {
            const { id, title, imageUrl, type, mealType, ingredients: dishIngredients, language } = dish;
            const encodedDishId = DishIdObfuscator.encode(DishProvider.INT_DMT_USER, id);
            const finalDishIngredients = dishIngredients.map(ingredient => ingredient.name);
            const relevance = calculateRelevance(ingredients, finalDishIngredients);
            const missingCount = calculateMissing(ingredients, finalDishIngredients);

            return {
                encodedDishId,
                title,
                imgUrl: imageUrl,
                type,
                mealType,
                ingredients: finalDishIngredients,
                language, provider: DishProvider.INT_DMT_USER, relevance, missingCount };
        });
    }
}