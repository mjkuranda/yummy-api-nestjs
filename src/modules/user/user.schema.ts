import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    login: String,
    password: String,
    isAdmin: Boolean,
    capabilities: Object,
    registeredTime: Number
});
