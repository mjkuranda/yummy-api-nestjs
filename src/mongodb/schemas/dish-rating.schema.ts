import * as mongoose from 'mongoose';

export const DishRatingSchema = new mongoose.Schema({
    dishId: {
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