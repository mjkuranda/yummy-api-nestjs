export class UserTokensVo {

    constructor(
        public readonly accessToken: string,
        public readonly refreshToken: string
    ) {}
}