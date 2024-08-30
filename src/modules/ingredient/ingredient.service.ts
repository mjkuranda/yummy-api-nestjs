import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'fs';
import {
    IngredientData,
    IngredientDataset,
    IngredientType, MealIngredient,
    MealIngredientWithoutImage
} from './ingredient.types';
import { ContextString } from '../../common/types';
import { AxiosService } from '../../services/axios.service';
import { SpoonacularIngredient } from '../api/spoonacular/spoonacular.api.types';
import { AxiosResponse } from 'axios';
import { MealEditDto } from '../meal/meal.dto';

@Injectable()
export class IngredientService {

    private ingredients: IngredientDataset;

    constructor(
        private readonly loggerService: LoggerService,
        private readonly axiosService: AxiosService
    ) {
        this.ingredients = new Map();
    }

    onModuleInit() {
        this.loadIngredients();
    }

    public filterIngredients(ingredients: IngredientType[]): IngredientType[] {
        if (!ingredients?.length) {
            return [];
        }

        return ingredients.filter(ingredient => this.ingredients.has(ingredient));
    }

    private loadIngredients(): void {
        const context: ContextString = 'IngredientService/loadIngredients';

        try {
            const rawData = fs.readFileSync('data/ingredients/ingredients.json', 'utf-8');
            const json = JSON.parse(rawData);

            this.ingredients = new Map(Object.entries(json));
            this.loggerService.info(context, `All ${Object.keys(json).length} ingredients has been loaded.`);
        } catch (err: unknown) {
            this.loggerService.error(context, `Error while loading all ingredients: ${typeof err === 'object' && err['message']}`);
        }
    }

    async wrapIngredientsWithImages(ingredients: MealIngredientWithoutImage[]): Promise<IngredientData[]> {
        // 1. Fetch all from ingredients (to get a potential image)
        const ingredientsFromJson: IngredientData[] = ingredients.map(ingredient => {
            return {
                id: ingredient.id,
                ...this.ingredients.get(ingredient.name)
            };
        });

        // 2. Filter those which does not have images
        const ingredientWithoutImages: IngredientData[] = ingredientsFromJson.filter(ingredient => !ingredient.imageUrl || ingredient.imageUrl?.length === 0);

        // 3. Send requests for them
        const ingredientsWithImagesResponse: Awaited<AxiosResponse<SpoonacularIngredient>>[] = await Promise.all(
            ingredientWithoutImages.map(ingredient =>
                this.axiosService.get<SpoonacularIngredient>(`https://api.spoonacular.com/food/ingredients/${ingredient.id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`)
            )
        );
        const ingredientsWithImages: SpoonacularIngredient[] = ingredientsWithImagesResponse.map(ingredientWithImageResponse => ingredientWithImageResponse.data);

        // 4. Update ingredients
        ingredientsWithImages.forEach(({ id, name, image }) => {
            const ingredient = this.ingredients.get(name);
            this.ingredients.set(name, { id, imageUrl: image, en: name, pl: ingredient.pl });
        });

        // 5. Save all ingredients asynchronously
        const context: ContextString = 'IngredientService/wrapIngredientsWithImages';
        try {
            const jsonObj = Object.fromEntries(this.ingredients);
            const jsonData = JSON.stringify(jsonObj, null, 4);

            fs.writeFile('data/ingredients/ingredients.json', jsonData, { encoding: 'utf-8' }, () => this.loggerService.info(context, 'Ingredients has been updated successfully.'));
            this.loggerService.info(context, 'Ingredients has been updated successfully.');
        } catch (err: any) {
            this.loggerService.error(context, `An error occurred while updating the ingredient file: ${err.message}`);
        }

        // 6. Modify initial request by updated and return (ingredients.map)
        return ingredients.map(ingredient => this.ingredients.get(ingredient.name));
    }

    applyWithImages(data: MealEditDto<MealIngredientWithoutImage>): MealEditDto<MealIngredient> {
        return {
            ...data,
            ingredients: data.ingredients.map(ingredient => ({
                ...ingredient,
                imageUrl: this.ingredients.get(ingredient.name).imageUrl
            }))
        };
    }
}