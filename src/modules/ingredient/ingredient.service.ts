import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'fs';
import { IngredientDataset, IngredientType } from './ingredient.types';
import { ContextString } from '../../common/types';

@Injectable()
export class IngredientService {

    private ingredients: IngredientDataset;

    constructor(
        private readonly loggerService: LoggerService
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
}