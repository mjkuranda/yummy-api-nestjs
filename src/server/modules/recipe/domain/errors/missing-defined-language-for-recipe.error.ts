export class MissingDefinedLanguageForRecipeError extends Error {

    constructor() {
        super('Recipe language cannot be empty');
    }
}