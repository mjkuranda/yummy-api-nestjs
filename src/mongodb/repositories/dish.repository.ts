import { AbstractRepository } from './abstract.repository';
import { DishDocument } from '../documents/dish.document';
import { InjectModel } from '@nestjs/mongoose';
import { dishModel } from '../../common/definitions/mongoose-model.definitions';
import { isValidObjectId, Model } from 'mongoose';
import { DishEditDto } from '../../modules/dish/dish.dto';
import { DishIngredient } from '../../modules/ingredient/ingredient.types';
import { CreateDishDataType, DetailedDish, RatedDish } from '../../modules/dish/dish.types';
import { calculateMissing, calculateRelevance } from '../../common/helpers';
import { DishProvidable } from '../../common/interfaces';
import { DishProvider, MealType } from '../../common/enums';
import { ForbiddenException } from '../../exceptions/forbidden-exception';
import { proceedDishDocumentToDishDetails } from '../../modules/dish/dish.utils';
import { ContextString, EncodedDishId } from '../../common/types';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { DishIdObfuscator } from '../../common/helpers/dish-id-obfuscator.helper';

export class DishRepository extends AbstractRepository<DishDocument, CreateDishDataType> implements DishProvidable {

    constructor(@InjectModel(dishModel.name) model: Model<DishDocument>) {
        super(model);
    }

    async getDishDetails(encodedDishId: EncodedDishId): Promise<DetailedDish | null> {
        const context: ContextString = 'DishRepository/findById';
        const { dishId: id } = DishIdObfuscator.decode(encodedDishId);

        if (!isValidObjectId(id)) {
            throw new NotFoundException(context, 'Dish not found, because ID is not valid ObjectId.');
        }

        const dishDocument: DishDocument = await this.model.findById(id);

        if (!dishDocument) {
            return null;
        }

        if (dishDocument.softAdded) {
            throw new ForbiddenException(context, `Dish with "${id}" id was not confirmed by admin. Therefore, it is impossible to see its content.`);
        }

        if (dishDocument.softDeleted) {
            throw new ForbiddenException(context, `Dish with "${id}" id is labeled to be deleted. Therefore, it is impossible to see its content.`);
        }

        const dishDetails: DetailedDish = proceedDishDocumentToDishDetails(dishDocument);

        return dishDetails;
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
            ]
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