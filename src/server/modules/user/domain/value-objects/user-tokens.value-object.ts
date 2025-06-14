export class UserTokensValueObject {

    constructor(
        public readonly accessToken: string,
        public readonly refreshToken: string
    ) {}
}