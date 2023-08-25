import { StatusCodes } from './types';

export interface GetQueryResult<DataType> {
    data?: DataType | DataType[];
    message: string;
    statusCode: StatusCodes;
}