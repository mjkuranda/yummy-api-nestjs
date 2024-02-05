import * as mongoose from 'mongoose';
import { IngredientSchema } from './ingredient.schema';

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
    softAdded: {
        type: Boolean
    },
    softDeleted: {
        type: Boolean
    },
    softEdited: {
        type: Object
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
