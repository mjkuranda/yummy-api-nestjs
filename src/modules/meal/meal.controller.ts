import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MealService } from './meal.service';

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
  public async createMeal(@Body() body) {
      console.log(body);
  }
}
