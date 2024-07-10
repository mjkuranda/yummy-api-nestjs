import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'fs';
import { IngredientCategory, IngredientDataObject, IngredientDataset, IngredientType } from './ingredient.types';

@Injectable()
export class IngredientService {

    private ingredientDatasets: IngredientDataObject;

    constructor(
        private readonly loggerService: LoggerService
    ) {
        this.ingredientDatasets = {
            'breads': [],
            'dairy-and-eggs': [],
            'fish-and-seafood': [],
            'fruits': [],
            'meats': [],
            'oils-and-fats': [],
            'pasta': [],
            'seeds-and-nuts': [],
            'spices': [],
            'vegetables': []
        };
    }

    onModuleInit() {
        this.init();
    }

    // TODO: Pass category and ingredient name to optimize it
    public filterIngredients(ingredients: IngredientType[]): IngredientType[] {
        return ingredients.filter(ingredient => {
            if (this.ingredientDatasets['breads'].includes(ingredient)) return true;
            if (this.ingredientDatasets['dairy-and-eggs'].includes(ingredient)) return true;
            if (this.ingredientDatasets['fish-and-seafood'].includes(ingredient)) return true;
            if (this.ingredientDatasets['fruits'].includes(ingredient)) return true;
            if (this.ingredientDatasets['meats'].includes(ingredient)) return true;
            if (this.ingredientDatasets['oils-and-fats'].includes(ingredient)) return true;
            if (this.ingredientDatasets['pasta'].includes(ingredient)) return true;
            if (this.ingredientDatasets['seeds-and-nuts'].includes(ingredient)) return true;
            if (this.ingredientDatasets['spices'].includes(ingredient)) return true;
            if (this.ingredientDatasets['vegetables'].includes(ingredient)) return true;

            return false;
        });
    }

    private init(): void {
        this.loadIngredientSet('breads');
        this.loadIngredientSet('dairy-and-eggs');
        this.loadIngredientSet('fish-and-seafood');
        this.loadIngredientSet('fruits');
        this.loadIngredientSet('meats');
        this.loadIngredientSet('oils-and-fats');
        this.loadIngredientSet('pasta');
        this.loadIngredientSet('seeds-and-nuts');
        this.loadIngredientSet('spices');
        this.loadIngredientSet('vegetables');
    }

    private loadIngredientSet(name: IngredientCategory): void {
        const rawData = fs.readFileSync(`data/ingredients/${name}.json`, 'utf-8');
        const { category, data } = <IngredientDataset>JSON.parse(rawData);
        const context = 'IngredientService/loadIngredientSet';
        const message = `${data.length} ingredients loaded from ${category.replaceAll('-', ' ')} category.`;

        this.ingredientDatasets[category].push(...data);
        this.loggerService.info(context, message);
    }
}