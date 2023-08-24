import * as mongoose from 'mongoose';

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
