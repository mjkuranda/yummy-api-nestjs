export class DishCommentDto {

    constructor(
        public readonly encodedDishIdValue: string,
        public readonly userLogin: string,
        public readonly content: string,
        public readonly posted: number
    ) {}
}