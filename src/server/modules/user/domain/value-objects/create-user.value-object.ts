export class CreateUserValueObject {

    constructor(
        public readonly login: string,
        public readonly email: string,
        public readonly hashedPassword: string
    ) {}
}