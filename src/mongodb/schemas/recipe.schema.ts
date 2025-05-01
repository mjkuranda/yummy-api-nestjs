import * as mongoose from 'mongoose';

const RecipeSectionSchema = new mongoose.Schema({
    name: String,
    steps: [String]
});

export const RecipeSchema = new mongoose.Schema({
    language: String, // FIXME: en, en-US, pl, ...
    sections: [RecipeSectionSchema]
});