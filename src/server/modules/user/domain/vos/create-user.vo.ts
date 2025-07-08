export class CreateUserVo {

    constructor(
        public readonly login: string,
        public readonly email: string,
        public readonly hashedPassword: string
    ) {}
}