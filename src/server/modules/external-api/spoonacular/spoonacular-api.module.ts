import { Module } from '@nestjs/common';
import { SpoonacularApiService } from '../../../../integrations/spoonacular-api/spoonacular-api.service';
import { SpoonacularApiAdapter } from '../../../../integrations/spoonacular-api/spoonacular-api.adapter';
import { HttpModule } from '@nestjs/axios';
import { EXTERNAL_API_DATA_ADAPTABLE_TOKEN } from '../../../../integrations/interfaces';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        })
    ],
    providers: [
        SpoonacularApiService,
        {
            provide: EXTERNAL_API_DATA_ADAPTABLE_TOKEN,
            useClass: SpoonacularApiAdapter
        }
    ],
    exports: [
        SpoonacularApiService,
        SpoonacularApiAdapter
    ]
})
export class SpoonacularApiModule {}