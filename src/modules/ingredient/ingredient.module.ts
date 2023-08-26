import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { IngredientSchema } from './ingredient.schema';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: models.INGREDIENT_MODEL, schema: IngredientSchema },
        ]),
    ],
    controllers: [IngredientController],
    providers: [IngredientService],
})
export class IngredientModule {}
