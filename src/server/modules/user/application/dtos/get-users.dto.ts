import { UserDto } from './user.dto';

export class GetUsersDto {

    constructor(
        public readonly users: UserDto[]
    ) {}

}