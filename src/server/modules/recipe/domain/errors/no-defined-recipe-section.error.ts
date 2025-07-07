export class NoDefinedRecipeSectionError extends Error {

    constructor() {
        super('Recipe must have at least one section');
    }
}