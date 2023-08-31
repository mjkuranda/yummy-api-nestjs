import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealDto } from './meal.dto';
import { AuthService } from '../auth/auth.service';

@Controller('meals')
export class MealController {
    constructor(private readonly mealService: MealService,
                private readonly authService: AuthService) {}

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
        const authorizationResult = await this.authService.getAnalysis(jwt);

        if (!authorizationResult.isAuthenticated) {
            // error
            return;
        }

        console.log('creating meal');

        const body: CreateMealDto = {
            ...req.body,
            author: authorizationResult.user.login
        };
        
        return await this.mealService.create(body, jwt);
    }
}
