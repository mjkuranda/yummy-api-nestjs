import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealBodyDto, CreateMealDto, EditMealBodyDto, MealEditDto } from './meal.dto';

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
    public async createMeal(@Body() body: CreateMealBodyDto) {
        const { data } = body;

        return await this.mealService.create(data);
    }

    @Delete('/:id')
    @HttpCode(204)
    public async deleteMeal(@Param('id') id: string) {
        return await this.mealService.delete(id);
    }

    @Put('/:id')
    @HttpCode(200)
    public async updateMeal(@Param('id') id: string, @Body() body: EditMealBodyDto) {
        const { data } = body;

        return await this.mealService.edit(id, data);
    }

    @Post('/:id/create')
    @HttpCode(200)
    public async confirmCreatingMeal(@Param('id') id: string, @Body() body) {
        const { authenticatedUser } = body;

        return await this.mealService.confirmCreating(id, authenticatedUser);
    }

    @Post('/:id/edit')
    @HttpCode(200)
    public async confirmEditingMeal(@Param('id') id: string, @Body() body) {
        const { authenticatedUser } = body;

        return await this.mealService.confirmEditing(id, authenticatedUser);
    }

    @Post('/:id/delete')
    @HttpCode(200)
    public async confirmDeletingMeal(@Param('id') id: string, @Body() body) {
        const { authenticatedUser } = body;

        return await this.mealService.confirmDeleting(id, authenticatedUser);
    }
}
