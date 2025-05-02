import * as mongoose from 'mongoose';

export const UserSearchQuerySchema = new mongoose.Schema({
    ingredients: [String],
    date: Date,
    login: String
});

UserSearchQuerySchema.index({ login: 1 });