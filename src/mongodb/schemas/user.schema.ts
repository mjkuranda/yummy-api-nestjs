import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    email: String,
    login: String,
    password: String,
    salt: String,
    isAdmin: Boolean,
    capabilities: Object,
    registeredTime: Number,
    activated: {
        type: Number
    }
});
