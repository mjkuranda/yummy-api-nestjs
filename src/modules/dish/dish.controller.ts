import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    Headers,
    UseGuards,
    Request,
    UsePipes
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishBodyDto, CreateDishCommentBody, CreateDishRatingBody, EditDishBodyDto } from './dish.dto';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { CreationGuard } from '../../guards/creation.guard';
import { EditionGuard } from '../../guards/edition.guard';
import { DeletionGuard } from '../../guards/deletion.guard';
import { DetailedDishWithTranslations, GetDishesQueryType } from './dish.types';
import { IngredientName, MealType } from '../../common/enums';
import { DishQueryValidationPipe } from '../../pipes/dish-query-validation.pipe';
import { TranslationService } from '../translation/translation.service';
import { Language, TransformedBody } from '../../common/types';
import { IngredientService } from '../ingredient/ingredient.service';

@Controller('dishes')
export class DishController {
    constructor(private readonly dishService: DishService,
                private readonly translationService: TranslationService,
                private readonly ingredientService: IngredientService) {}

    @Get()
    @HttpCode(200)
    @UsePipes(DishQueryValidationPipe)
    public async getDishes(@Query() query: GetDishesQueryType) {
        const { ings, type } = query;
        const ingredients = ings.split(',');

        return await this.dishService.getDishes(<IngredientName[]>ingredients, <MealType>type);
    }

    @Get('/:id')
    @HttpCode(200)
    public async getDish(@Param('id') id: string) {
        return await this.dishService.find(id);
    }

    @Get('/:id/details')
    @HttpCode(200)
    public async getDishDetails(@Param('id') id: string, @Headers('accept-language') lang: Language): Promise<DetailedDishWithTranslations> {
        const dish = await this.dishService.getDishDetails(id);
        const { description, ingredients, recipe } = await this.translationService.translateDish(dish, lang);

        return { dish, description, ingredients, recipe };
    }

    @Post('/create')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createDish(@Body() body: CreateDishBodyDto) {
        const { data, authenticatedUser } = body;

        return await this.dishService.create(data, authenticatedUser);
    }

    @Delete('/:id')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async deleteDish(@Param('id') id: string) {
        return await this.dishService.delete(id);
    }

    @Put('/:id')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async updateDish(@Param('id') id: string, @Body() body: EditDishBodyDto) {
        const { data } = body;
        const dataWithImages = this.ingredientService.applyWithImages(data);

        return await this.dishService.edit(id, dataWithImages);
    }

    @Post('/:id/create')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CreationGuard)
    public async confirmCreatingDish(@Param('id') id: string, @Body() body) {
        const { authenticatedUser } = body;

        return await this.dishService.confirmCreating(id, authenticatedUser);
    }

    @Post('/:id/edit')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, EditionGuard)
    public async confirmEditingDish(@Param('id') id: string, @Body() body) {
        const { authenticatedUser } = body;

        return await this.dishService.confirmEditing(id, authenticatedUser);
    }

    @Post('/:id/delete')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, DeletionGuard)
    public async confirmDeletingDish(@Param('id') id: string, @Body() body) {
        const { authenticatedUser } = body;

        return await this.dishService.confirmDeleting(id, authenticatedUser);
    }

    @Get('/:id/comments')
    @HttpCode(200)
    public async getComments(@Param('id') id: string) {
        return await this.dishService.getComments(id);
    }

    @Post('/:id/comment')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async addDishComment(@Body() body: TransformedBody<CreateDishCommentBody>) {
        const { data, authenticatedUser } = body;

        return await this.dishService.addComment(data, authenticatedUser.login);
    }

    @Get('/:id/rating')
    @HttpCode(200)
    public async getRating(@Param('id') id: string) {
        return await this.dishService.calculateRating(id);
    }

    @Post('/:id/rating')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async addRating(@Body() body: TransformedBody<CreateDishRatingBody>) {
        const { data, authenticatedUser } = body;

        return await this.dishService.addRating(data, authenticatedUser.login);
    }

    @Get('/proposal/all')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async getDishProposal(@Request() req) {
        const { authenticatedUser } = req.body;

        return await this.dishService.getDishProposal(authenticatedUser);
    }

    @Post('/proposal')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async addDishProposal(@Request() req) {
        const { authenticatedUser, data } = req.body;
        const { ingredients } = data;

        return await this.dishService.addDishProposal(authenticatedUser, ingredients);
    }

    @Get('/soft/added')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CreationGuard)
    public async getSoftAddedDishes() {
        return await this.dishService.getDishesSoftAdded();
    }

    @Get('/soft/edited')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, EditionGuard)
    public async getSoftEditedDishes() {
        return await this.dishService.getDishesSoftEdited();
    }

    @Get('/soft/deleted')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, DeletionGuard)
    public async getSoftDeletedDishes() {
        return await this.dishService.getDishesSoftDeleted();
    }

    @Get('/x/ingredient-images')
    public async getIngredientImages() {
        return await this.ingredientService.fetchAllImages();
    }
}
