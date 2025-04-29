import * as mongoose from 'mongoose';

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
        type: String, // FIXME: As a language type
        required: true
    },
    mealType: {
        type: String, // FIXME: As a meal type
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
        type: String, // FIXME: As a dish type
        required: true
    }
});
