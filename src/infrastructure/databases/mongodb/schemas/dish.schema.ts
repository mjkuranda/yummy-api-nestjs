import * as mongoose from 'mongoose';
import { supportedLanguages } from '../../constants/language.constant';
import { DishType, MealType } from '../../common/enums';

const IngredientDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    unit: {
        type: String, // FIXME: As a particular unit type
        required: true
    },
    imageUrl: {
        type: String
    }
});

export const DishSchema = new mongoose.Schema({
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
        type: [IngredientDataSchema],
        required: true
    },
    language: {
        type: String,
        enum: supportedLanguages,
        required: true
    },
    mealType: {
        type: String,
        enum: Object.values(MealType),
        required: true
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
    readyInMinutes: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(DishType),
        required: true
    }
});

DishSchema.index(
    { 'ingredients.name': 1 },
    {
        partialFilterExpression: {
            softDeleted: false,
            softAdded: false
        }
    }
);