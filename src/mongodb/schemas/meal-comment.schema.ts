import * as mongoose from 'mongoose';

export const MealCommentSchema = new mongoose.Schema({
    mealId: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    posted: {
        type: Number,
        required: true
    }
});