import { Language } from '../../../../common/types';
import { DishId, DishRecipeSections } from '../../../dish/dish.types';

export class Recipe {
    private readonly _language: Language;
    private readonly _dishId: DishId;
    private readonly _sections: DishRecipeSections;

    constructor(
        language: Language,
        dishId: DishId,
        sections: DishRecipeSections,
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

    get sections(): DishRecipeSections {
        return this._sections;
    }

    // Domain validation methods
    private validateLanguage(language: Language): void {
        if (!language) {
            throw new Error('Recipe language cannot be empty');
        }
    }

    private validateDishId(dishId: DishId): void {
        if (!dishId) {
            throw new Error('Recipe must be associated with a dish');
        }
    }

    private validateSections(sections: DishRecipeSections): void {
        if (!sections || Object.keys(sections).length === 0) {
            throw new Error('Recipe must have at least one section');
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
        sections: DishRecipeSections;
    }> {
        return {
            language: this._language,
            dishId: this._dishId,
            sections: this._sections,
        };
    }
}