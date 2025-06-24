import { Provider } from '@nestjs/common';
import { ProvidableApiService } from './internal-apis/providable-api/providable-api.service';
import { spoonacularApiExports } from './external-apis/spoonacular-api/spoonacular-api.providers';

export const PROVIDABLE_SERVICES: Provider[] = [
    ProvidableApiService,
    ...spoonacularApiExports
];