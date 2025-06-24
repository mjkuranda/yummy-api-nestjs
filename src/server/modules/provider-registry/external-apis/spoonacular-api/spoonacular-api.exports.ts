import { Provider } from '@nestjs/common';
import { SpoonacularApiService } from '../../../../../integrations/spoonacular-api/spoonacular-api.service';

export const spoonacularApiExports: Provider[] = [
    SpoonacularApiService
];