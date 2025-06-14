export class CreatedUserDto {

    constructor(
        public readonly login: string,
        public readonly email: string,
        public readonly isActivated: boolean
    ) {}
}