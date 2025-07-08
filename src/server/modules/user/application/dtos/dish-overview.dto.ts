import { DishOverviewVo } from '../../domain/vos';

export class DishOverviewDto {

    constructor(
        public readonly title: string
    ) {}

    static fromDishOverviewVo(dishOverviewVo: DishOverviewVo): DishOverviewDto {
        return new DishOverviewDto(dishOverviewVo.title);
    }
}