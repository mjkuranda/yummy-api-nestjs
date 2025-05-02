import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    email: String,
    login: String,
    password: String,
    salt: String,
    isAdmin: Boolean,
    capabilities: Object, // FIXME: As a capability schema
    registeredTime: Number,
    activated: {
        type: Number
    }
});

UserSchema.index({ login: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });