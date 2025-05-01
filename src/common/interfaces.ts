import { UserAccessTokenPayload } from '../modules/jwt-manager/jwt-manager.types';

/**
 * @description Transformed endpoint body
 */
export interface TransformedBody<TData> {
    data: TData;
    authenticatedUser: UserAccessTokenPayload;
}