import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealDto } from './meal.dto';

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
}
