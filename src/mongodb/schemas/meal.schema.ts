import * as mongoose from 'mongoose';

const IngredientDataSchema = new mongoose.Schema({
    en: {
        type: String,
        required: true
    },
    pl: {
        type: String,
        required: true
    },
    id: {
        type: Number
    },
    imageUrl: {
        type: String
    }
});

const RecipeSectionSchema = new mongoose.Schema({
    name: String,
    steps: [String]
});

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
        type: [IngredientDataSchema],
        required: true
    },
    language: {
        type: String,
        required: true
    },
    posted: {
        type: Number,
        required: true
    },
    recipeSections: {
        type: [RecipeSectionSchema],
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
    }
});
