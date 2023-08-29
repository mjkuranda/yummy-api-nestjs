import { Body, Controller, Get, HttpCode, Post, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto } from './ingredient.dto';
import { Request } from 'express';

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
    public async createIngredient(@Req() req: Request, @Body() body: CreateIngredientDto) {
        const { jwt } = req.cookies;
        
        return await this.ingredientService.create(body, jwt);
    }
}