import * as mongoose from 'mongoose';

export const UserActionSchema = new mongoose.Schema({
    userId: String,
    type: String
});