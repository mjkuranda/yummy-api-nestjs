import { IngredientCategory } from '../modules/ingredient/ingredient.types';
import * as fs from 'fs';

type DataFileName = `ingredients/${IngredientCategory}` | 'ingredients/ingredients' | 'ingredients/pantry' | 'initial-dishes';

export async function asyncLoadFile(fileName: DataFileName): Promise<string> {
    return fs.promises.readFile(`data/${fileName}.json`, 'utf-8');
}

export async function loadDataFile<T>(fileName: DataFileName): Promise<T> {
    const loadedData = await asyncLoadFile(fileName);

    return JSON.parse(loadedData);
}

export async function saveDataFile<T>(fileName: DataFileName, data: T): Promise<void> {
    const jsonData = JSON.stringify(data, null, 4);

    await fs.promises.writeFile(`data/${fileName}.json`, jsonData, { encoding: 'utf-8' });
}