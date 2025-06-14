import { DishOverviewValueObject } from '../../domain/value-objects';

export class DishOverviewDto {

    constructor(
        public readonly title: string
    ) {}

    static fromDishOverviewVo(dishOverviewVo: DishOverviewValueObject): DishOverviewDto {
        return new DishOverviewDto(dishOverviewVo.title);
    }
}