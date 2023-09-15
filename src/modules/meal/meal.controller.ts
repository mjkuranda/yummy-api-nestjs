import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealDto, MealEditDto } from './meal.dto';

@Controller('meals')
export class MealController {
    constructor(private readonly mealService: MealService) {}

    @Get()
    @HttpCode(200)
    public async getMeals() {
        return await this.mealService.findAll();
    }

    @Get('/:id')
    @HttpCode(200)
    public async getMeal(@Param('id') id: string) {
        return await this.mealService.find(id);
    }

    @Post('/create')
    @HttpCode(201)
    public async createMeal(@Body() body: CreateMealDto) {
        return await this.mealService.create(body);
    }

    @Delete(':id')
    @HttpCode(204)
    public async deleteMeal(@Param('id') id: string) {
        return await this.mealService.delete(id);
    }

    @Put(':id')
    @HttpCode(200)
    public async updateMeal(@Param('id') id: string, @Body() body: MealEditDto) {
        return await this.mealService.edit(id, body);
    }
}
