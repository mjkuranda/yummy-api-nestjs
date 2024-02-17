import * as mongoose from 'mongoose';

export const SearchQuerySchema = new mongoose.Schema({
    ingredients: [String],
    date: Date,
    login: String
});