import { Language } from '../../../../common/types';
import { DishRecipeSection } from '../../../../common/types';

export class GetRecipeDto {

    constructor(
        public readonly encodedDishIdValue: string,
        public readonly language: Language,
        public readonly sections: DishRecipeSection[]
    ) {}

}