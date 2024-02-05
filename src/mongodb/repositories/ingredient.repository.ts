import { AbstractRepository } from './abstract.repository';
import { IngredientDocument } from '../documents/ingredient.document';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';

export class IngredientRepository extends AbstractRepository<IngredientDocument> {

    constructor(@InjectModel(models.INGREDIENT_MODEL) model: Model<IngredientDocument>) {
        super(model);
    }
}