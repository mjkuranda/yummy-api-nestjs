import { GetDishDto } from './get-dish.dto';

export class GetDishesDto {

    constructor(
        public readonly dishes: GetDishDto[]
    ) {}
}