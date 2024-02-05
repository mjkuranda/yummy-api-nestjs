import { AbstractRepository } from './abstract.repository';
import { MealDocument } from '../documents/meal.document';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';

export class MealRepository extends AbstractRepository<MealDocument> {

    constructor(@InjectModel(models.MEAL_MODEL) model: Model<MealDocument>) {
        super(model);
    }
}