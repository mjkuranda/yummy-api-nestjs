import { AbstractRepository } from './abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { MealRatingDocument } from '../documents/meal-rating.document';
import { CreateMealRatingDto } from '../../modules/meal/meal.dto';

export class MealRatingRepository extends AbstractRepository<MealRatingDocument, CreateMealRatingDto> {

    constructor(@InjectModel(models.MEAL_RATING_MODEL) model: Model<MealRatingDocument>) {
        super(model);
    }
}