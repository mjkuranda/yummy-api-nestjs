import { StatusCodes } from './types';

export interface QueryResult<DataType> {
    data?: DataType | DataType[];
    message: string;
    statusCode: StatusCodes;
}
