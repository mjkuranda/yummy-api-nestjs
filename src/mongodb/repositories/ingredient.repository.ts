import { AbstractRepository } from './abstract.repository';
import { IngredientDocument } from '../documents/ingredient.document';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { CreateIngredientDto } from '../../modules/ingredient/ingredient.dto';

export class IngredientRepository extends AbstractRepository<IngredientDocument, CreateIngredientDto> {

    constructor(@InjectModel(models.INGREDIENT_MODEL) model: Model<IngredientDocument>) {
        super(model);
    }
}