import { Document } from 'mongoose';

export type UserActionType = 'activate';

export class UserActionDocument extends Document {
    userId: string;
    type: UserActionType;
}