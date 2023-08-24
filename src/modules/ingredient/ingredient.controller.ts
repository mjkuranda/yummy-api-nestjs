import {Body, Controller, Get, HttpCode, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {IngredientService} from './ingredient.service';
import {CreateIngredientDto} from "./ingredient.dto";

@Controller('ingredients')
export class IngredientController {
    constructor(private readonly ingredientService: IngredientService) {}

    @Get()
    public async getIngredients() {
        return await this.ingredientService.findAll();
    }

    @Post('/create')
    @HttpCode(200)
    @UsePipes(ValidationPipe)
    public async createIngredient(@Body() body: CreateIngredientDto) {
        return await this.ingredientService.create(body);
    }
}