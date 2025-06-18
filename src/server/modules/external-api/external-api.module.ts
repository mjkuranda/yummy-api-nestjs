import { Module } from '@nestjs/common';
import { SpoonacularApiModule } from './spoonacular/spoonacular-api.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
        SpoonacularApiModule
    ],
    exports: [
        HttpModule,
        SpoonacularApiModule
    ]
})
export class ExternalApiModule {}