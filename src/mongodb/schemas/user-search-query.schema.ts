import * as mongoose from 'mongoose';

export const UserSearchQuerySchema = new mongoose.Schema({
    ingredients: {
        type: [String],
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    login: {
        type: String,
        required: true
    }
});

UserSearchQuerySchema.index({ login: 1 });