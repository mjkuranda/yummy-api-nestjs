import { DishResultDto } from './dish-result.dto';

export class GetDishResultsDto {

    constructor(
        public readonly results: DishResultDto[]
    ) {}

}