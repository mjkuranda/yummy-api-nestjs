import { StatusCodes } from '../../common/types';

export interface AuthResult {
    message: string;
    statusCode: StatusCodes;
    isAuthenticated?: boolean;
}