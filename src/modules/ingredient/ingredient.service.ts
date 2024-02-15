import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'fs';
import { IngredientCategory, IngredientDataObject, IngredientDataset } from './ingredient.types';

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