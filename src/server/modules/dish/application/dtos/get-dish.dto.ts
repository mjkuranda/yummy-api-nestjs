export class GetDishDto {

    constructor(
        public readonly encodedDishId: string,
        public readonly title: string,
        public readonly author: string
    ) {}
}