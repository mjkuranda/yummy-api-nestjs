import * as mongoose from 'mongoose';
import { supportedLanguages } from '../../../../server/constants/language.constant';

const DishRecipeSectionSchema = new mongoose.Schema({
    name: String,
    steps: [String]
});

export const DishRecipeSchema = new mongoose.Schema({
    dishId: String,
    language: {
        type: String,
        enum: supportedLanguages,
        required: true
    },
    sections: [DishRecipeSectionSchema]
});

DishRecipeSchema.index({ dishId: 1 }, { unique: true });