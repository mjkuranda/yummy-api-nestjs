import * as mongoose from 'mongoose';

const RecipeSectionStepsSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        min: 1
    },
    step: {
        type: String,
        required: true
    }
});

const RecipeSectionSchema = new mongoose.Schema({
    name: String,
    steps: [RecipeSectionStepsSchema]
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
        type: [String],
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
