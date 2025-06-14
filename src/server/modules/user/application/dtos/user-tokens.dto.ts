export class UserTokensDto {

    constructor(
        public readonly accessToken: string,
        public readonly refreshToken: string
    ) {}
}