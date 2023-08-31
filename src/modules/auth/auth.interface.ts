import { StatusCodes } from '../../common/types';
import { UserDocument } from '../user/user.interface';

export interface AuthResult {
    message: string;
    statusCode: StatusCodes;
    isAuthenticated?: boolean;
    user?: UserDocument;
}

export interface UserDataPayload {
    login: string;
}