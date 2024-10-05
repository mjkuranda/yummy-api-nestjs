import * as mongoose from 'mongoose';

export const DishCommentSchema = new mongoose.Schema({
    dishId: {
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