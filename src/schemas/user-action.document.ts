import { Document } from 'mongoose';

type UserActionType = 'activate';

export class UserActionDocument extends Document {
    userId: string;
    type: UserActionType;
}