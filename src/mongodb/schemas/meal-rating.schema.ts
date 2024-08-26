import * as mongoose from 'mongoose';

export const MealRatingSchema = new mongoose.Schema({
    mealId: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    posted: {
        type: Number,
        required: true
    }
});