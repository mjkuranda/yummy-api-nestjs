import { Module } from '@nestjs/common';
import { SpoonacularApiModule } from './spoonacular/spoonacular.api.module';
import { ExternalApiService } from './external-api.service';

@Module({
    imports: [SpoonacularApiModule],
    controllers: [],
    providers: [ExternalApiService],
    exports: [ExternalApiService]
})
export class ExternalApiModule {}