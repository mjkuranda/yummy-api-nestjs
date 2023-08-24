import * as mongoose from 'mongoose';

export const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
});
