import { Language } from '../../../../common/types';
import { DishId, DishRecipeSection } from '../../../../common/types';
import {
    MissingDefinedLanguageForRecipeError,
    MissingDishAssociationForRecipeError,
    NoDefinedRecipeSectionError
} from '../errors';

export class RecipeEntity {
    private readonly _language: Language;
    private readonly _dishId: DishId;
    private readonly _sections: DishRecipeSection[];

    constructor(
        language: Language,
        dishId: DishId,
        sections: DishRecipeSection[]
    ) {
        this.validateLanguage(language);
        this.validateDishId(dishId);
        this.validateSections(sections);

        this._language = language;
        this._dishId = dishId;
        this._sections = sections;
    }

    get language(): Language {
        return this._language;
    }

    get dishId(): DishId {
        return this._dishId;
    }

    get sections(): DishRecipeSection[] {
        return this._sections;
    }

    // Domain validation methods
    private validateLanguage(language: Language): void {
        if (!language) {
            throw new MissingDefinedLanguageForRecipeError();
        }
    }

    private validateDishId(dishId: DishId): void {
        if (!dishId) {
            throw new MissingDishAssociationForRecipeError();
        }
    }

    private validateSections(sections: DishRecipeSection[]): void {
        if (!sections || Object.keys(sections).length === 0) {
            throw new NoDefinedRecipeSectionError();
        }
    }

    // Domain methods
    public isInLanguage(language: Language): boolean {
        return this._language === language;
    }

    public belongsToDish(dishId: string): boolean {
        return this._dishId === dishId;
    }

    // Method to create an immutable snapshot of the recipe
    public toSnapshot(): Readonly<{
        language: Language;
        dishId: DishId;
        sections: DishRecipeSection[];
    }> {
        return {
            language: this._language,
            dishId: this._dishId,
            sections: this._sections,
        };
    }
}