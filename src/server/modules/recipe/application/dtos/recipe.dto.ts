import { IsIn, IsNotEmpty } from 'class-validator';
import { DishRecipeSections } from '../../../dish/dish.types';
import { Language } from '../../../../common/types';
import { supportedLanguages } from '../../../../constants/language.constant';
import { RecipeEntity } from '../../domain/entities';

export class CreateRecipeDto {
    @IsNotEmpty({ message: 'Recipe should have a specific language' })
    @IsIn(supportedLanguages, { message: `Recipe should be defined in a one of supported languages: ${supportedLanguages.join(', ')}` })
    readonly language: Language;

    @IsNotEmpty({ message: 'Recipe should be assigned to a specific dish' })
    readonly dishId: string;

    @IsNotEmpty({ message: 'Recipe should have at least one section' })
    readonly sections: DishRecipeSections;
}

export type CreatedRecipeDto = RecipeEntity;

export type GetRecipeDto = RecipeEntity;