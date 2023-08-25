import * as mongoose from 'mongoose';
import {IngredientSchema} from '../ingredient/ingredient.schema';

export const MealSchema = new mongoose.Schema({
    author: {
        type: String
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String
    },
    ingredients: {
        type: [Object],
        required: true,
        properties: {
            ...IngredientSchema
        }
    },
    posted: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
});
