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
import { DishCommandFacade } from './application/dish-command.facade';
import {
    CreateDishCommentBody,
    CreateDishDto,
    CreateDishRatingBody,
    EditDishBodyDto
} from './dish.dto';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { CreationGuard } from '../../guards/creation.guard';
import { EditionGuard } from '../../guards/edition.guard';
import { DeletionGuard } from '../../guards/deletion.guard';
import { DetailedDishWithTranslations, GetDishesQueryType, RatedDish } from './dish.types';
import { IngredientName, MealType } from '../../common/enums';
import { DishQueryValidationPipe } from '../../pipes/dish-query-validation.pipe';
import { EncodedDishId, Language } from '../../common/types';
import { IngredientService } from '../ingredient/ingredient.service';
import { TransformedBody } from '../../common/interfaces';
import { DishIngredientWithoutImage } from '../ingredient/ingredient.types';
import { DishQueryFacade } from './application/dish-query.facade';

@Controller('dishes')
export class DishController {

    constructor(
        private readonly dishQueryFacade: DishQueryFacade,
        private readonly dishCommandFacade: DishCommandFacade,
        private readonly ingredientService: IngredientService
    ) {}

    @Get()
    @HttpCode(200)
    @UsePipes(DishQueryValidationPipe)
    public async getDishes(@Query() query: GetDishesQueryType): Promise<RatedDish[]> {
        const { ings, type } = query;
        const ingredients = ings.split(',');

        return await this.dishQueryFacade.getDishes(<IngredientName[]>ingredients, <MealType>type);
    }

    @Get('/:encoded-id/details')
    @HttpCode(200)
    public async getDishDetails(@Param('encoded-id') encodedDishId: EncodedDishId, @Headers('accept-language') language: Language = 'pl'): Promise<DetailedDishWithTranslations> {
        return await this.dishQueryFacade.getDishDetails(encodedDishId, language);
    }

    @Post('/create')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createDish(@Body() body: TransformedBody<CreateDishDto<DishIngredientWithoutImage>>) {
        const { data, authenticatedUser } = body;

        return await this.dishCommandFacade.createDish(data, authenticatedUser);
    }

    @Put('/:encoded-id')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async updateDish(@Param('encoded-id') encodedDishId: EncodedDishId, @Body() body: EditDishBodyDto) {
        const { data } = body;
        const dataWithImages = this.ingredientService.applyWithImages(data);

        return await this.dishCommandFacade.editDish(encodedDishId, dataWithImages);
    }

    @Delete('/:encoded-id')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async deleteDish(@Param('encoded-id') encodedDishId: EncodedDishId) {
        return await this.dishCommandFacade.deleteDish(encodedDishId);
    }

    @Post('/:encoded-id/create')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard, CreationGuard)
    public async confirmCreatingDish(@Param('encoded-id') encodedDishId: EncodedDishId, @Body() body) {
        const { authenticatedUser } = body;

        return await this.dishCommandFacade.confirmCreating(encodedDishId, authenticatedUser);
    }

    @Post('/:encoded-id/edit')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, EditionGuard)
    public async confirmEditingDish(@Param('encoded-id') encodedDishId: EncodedDishId, @Body() body) {
        const { authenticatedUser } = body;

        return await this.dishCommandFacade.confirmEditing(encodedDishId, authenticatedUser);
    }

    @Post('/:encoded-id/delete')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, DeletionGuard)
    public async confirmDeletingDish(@Param('encoded-id') encodedDishId: EncodedDishId, @Body() body) {
        const { authenticatedUser } = body;

        return await this.dishCommandFacade.confirmDeleting(encodedDishId, authenticatedUser);
    }

    @Get('/:encoded-id/comments')
    @HttpCode(200)
    public async getComments(@Param('encoded-id') encodedDishId: EncodedDishId) {
        return await this.dishQueryFacade.getDishComments(encodedDishId);
    }

    @Post('/:encoded-id/comment')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async addDishComment(@Body() body: TransformedBody<CreateDishCommentBody>) {
        const { data, authenticatedUser } = body;

        return await this.dishCommandFacade.addDishComment(data, authenticatedUser.login);
    }

    @Get('/:encoded-id/rating')
    @HttpCode(200)
    public async getRating(@Param('encoded-id') encodedDishId: EncodedDishId) {
        return await this.dishQueryFacade.getDishRating(encodedDishId);
    }

    @Post('/:encoded-id/rating')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async addRating(@Body() body: TransformedBody<CreateDishRatingBody>) {
        const { data, authenticatedUser } = body;

        return await this.dishCommandFacade.addDishRating(data, authenticatedUser.login);
    }

    @Get('/proposal/all')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async getDishProposal(@Request() req) {
        const { authenticatedUser } = req.body;

        return await this.dishQueryFacade.getDishProposal(authenticatedUser);
    }

    @Post('/proposal')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async addDishProposal(@Request() req) {
        const { authenticatedUser, data } = req.body;
        const { ingredients } = data;

        return await this.dishCommandFacade.addDishProposal(authenticatedUser, ingredients);
    }

    @Get('/soft/added')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CreationGuard)
    public async getSoftAddedDishes() {
        return await this.dishQueryFacade.getDishesWithSoftAdded();
    }

    @Get('/soft/edited')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, EditionGuard)
    public async getSoftEditedDishes() {
        return await this.dishQueryFacade.getDishesWithSoftEdited();
    }

    @Get('/soft/deleted')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, DeletionGuard)
    public async getSoftDeletedDishes() {
        return await this.dishQueryFacade.getDishesWithSoftDeleted();
    }
}
