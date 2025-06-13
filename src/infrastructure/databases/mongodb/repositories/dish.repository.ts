import { AbstractRepository } from './abstract.repository';
import { DishDocument } from '../documents/dish.document';
import { InjectModel } from '@nestjs/mongoose';
import { dishModel } from '../../common/definitions/mongoose-model.definitions';
import { FilterQuery, Model } from 'mongoose';
import { DishEditDto } from '../../modules/dish/dish.dto';
import { DishIngredient } from '../../modules/ingredient/ingredient.types';
import { CreateDishDataType, DishId, RatedDish } from '../../modules/dish/dish.types';
import { calculateMissing, calculateRelevance } from '../../common/helpers';
import { Provider, MealType } from '../../common/enums';
import { EncodedDishId } from '../../modules/dish/domain/common/encoded-dish-id.value-object';
import { DishFactory } from '../../modules/dish/domain/common/factories';
import { DishEntity } from '../../modules/dish/domain/common/entities';

// TODO: Deprecated
export class DishRepository extends AbstractRepository<DishDocument, CreateDishDataType> {

    constructor(@InjectModel(dishModel.name) model: Model<DishDocument>) {
        super(model);
    }

    async findById(id: DishId): Promise<DishEntity | null> {
        const dish = super.findById(id);

        return DishFactory.fromDocument(dish);
    }

    async create(data: CreateDishDataType, author?: string, ingredients?: DishIngredient[]) {
        return this.model.create({
            ...data,
            ingredients,
            author,
            posted: Date.now(),
            provider: Provider.INT_DMT_USER,
            softAdded: true
        });
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

    async findOneAvailable(id: DishId): Promise<DishDocument | null> {
        return this.model.findOne({
            _id: id,
            softAdded: { $exists: false },
            softDeleted: { $exists: false }
        });
    }

    async unsetSoftAdded(id: DishId): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $unset: {
                softAdded: true
            }
        });
    }

    async insertEdition(id: DishId, dishEditDto: DishEditDto<DishIngredient>): Promise<void> {
        await this.model.updateOne({ _id: id }, {
            $set: {
                softEdited: dishEditDto
            }
        });
    }

    async confirmEdition(id: DishId, dishSoftEdited?: DishDocument): Promise<void> {
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

    getProvider(): Provider {
        return Provider.INT_DMT_USER;
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
            const encodedDishId = EncodedDishId.fromParts(Provider.INT_DMT_USER, id);
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
                language, provider: Provider.INT_DMT_USER, relevance, missingCount };
        });
    }
}