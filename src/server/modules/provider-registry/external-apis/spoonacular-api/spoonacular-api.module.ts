import { Module } from '@nestjs/common';
import { spoonacularApiServiceProvider } from './spoonacular-api.service.provider';
import { spoonacularApiExports } from './spoonacular-api.exports';

@Module({
    providers: [...spoonacularApiServiceProvider],
    exports: [...spoonacularApiExports, ...spoonacularApiServiceProvider]
})
export class SpoonacularApiModule {}