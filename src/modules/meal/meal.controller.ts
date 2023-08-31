import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealDto } from './meal.dto';

@Controller('meals')
export class MealController {
    constructor(private readonly mealService: MealService) {}

    @Get()
    public async getMeals() {
        return await this.mealService.findAll();
    }

    @Get('/:id')
    public async getMeal(@Param('id') id: string) {
        return await this.mealService.find(id);
    }

    @Post('/create')
    public async createMeal(@Request() req) {
        const { jwt } = req.cookies;

        const body: CreateMealDto = {
            ...req.body
        };
        
        return await this.mealService.create(body, jwt);
    }
}
