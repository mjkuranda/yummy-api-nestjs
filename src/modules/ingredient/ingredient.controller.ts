import { Body, Controller, Get, HttpCode, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto } from './ingredient.dto';
import { AdminGuard } from '../../guards/admin.guard';
import { AuthenticationGuard } from '../../guards/authentication.guard';

@Controller('ingredients')
export class IngredientController {
    constructor(private readonly ingredientService: IngredientService) {}

    @Get()
    @HttpCode(200)
    public async getIngredients() {
        return await this.ingredientService.findAll();
    }

    @Post('/create')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard, AdminGuard)
    @UsePipes(ValidationPipe)
    public async createIngredient(@Body() body: CreateIngredientDto) {
        return await this.ingredientService.create(body);
    }
}