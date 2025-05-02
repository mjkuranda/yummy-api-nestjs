import * as mongoose from 'mongoose';
import { supportedLanguages } from '../../constants/language.constant';

const DishRecipeSectionSchema = new mongoose.Schema({
    name: String,
    steps: [String]
});

export const DishRecipeSchema = new mongoose.Schema({
    language: {
        type: String,
        enum: supportedLanguages,
        required: true
    },
    sections: [DishRecipeSectionSchema]
});