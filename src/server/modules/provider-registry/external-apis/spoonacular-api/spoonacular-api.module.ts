import { Module } from '@nestjs/common';
import { spoonacularApiProviders } from './spoonacular-api.providers';
import { spoonacularApiExports } from './spoonacular-api.exports';

@Module({
    providers: [...spoonacularApiProviders],
    exports: [...spoonacularApiExports, ...spoonacularApiProviders]
})
export class SpoonacularApiModule {}