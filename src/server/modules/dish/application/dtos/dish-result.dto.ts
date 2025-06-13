import { Provider } from '../../../../common/enums';
import { Language } from '../../../../common/types';

export class DishResultDto {

    constructor(
        public readonly title: string,
        public readonly language: Language,
        public readonly provider: Provider,
        public readonly relevance: number,
        public readonly missingIngredientCount: number,
        public readonly imgUrl?: string
    ) {}

}