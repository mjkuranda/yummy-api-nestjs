import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { INGREDIENT_MODEL } from '../../constants/models.constant';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { RedisModule } from '../redis/redis.module';
import { IngredientRepository } from '../../mongodb/repositories/ingredient.repository';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';

@Module({
    imports: [
        MongooseModule.forFeature([INGREDIENT_MODEL]),
        RedisModule,
        JwtManagerModule
    ],
    controllers: [IngredientController],
    providers: [IngredientService, IngredientRepository, JwtManagerService],
})
export class IngredientModule {}
