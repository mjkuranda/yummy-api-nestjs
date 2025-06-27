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
import { GetDishesQueryType } from './dish.types';
import { IngredientName, MealType } from '../../common/enums';
import { DishQueryValidationPipe } from '../../pipes/dish-query-validation.pipe';
import { Language } from '../../common/types';
import { IngredientService } from '../ingredient/ingredient.service';
import { TransformedBody } from '../../common/interfaces';
import { DishIngredientWithoutImage } from '../ingredient/ingredient.types';
import { DishQueryFacade } from './application/dish-query.facade';
import { EncodedDishIdValueObject } from './domain/common/value-objects';
import {
    AddedDishRatingDto, ConfirmedDeletingDto,
    ConfirmedEditingDto,
    GetDishCommentsDto,
    GetDishDetailsDto, GetDishesDto,
    GetDishProposalsDto,
    GetDishRatingDto,
    GetDishResultsDto
} from './application/dtos';

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
    public async getDishes(
        @Query() query: GetDishesQueryType
    ): Promise<GetDishResultsDto> {
        const { ings, type } = query;
        const ingredients = ings.split(',');

        return await this.dishQueryFacade.getDishes(<IngredientName[]>ingredients, <MealType>type);
    }

    @Get('/:encoded-dish-id/details')
    @HttpCode(200)
    public async getDishDetails(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Headers('accept-language') language: Language = 'pl'
    ): Promise<GetDishDetailsDto> {
        return await this.dishQueryFacade.getDishDetails(encodedDishId, language);
    }

    @Post('/create')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createDish(
        @Body() body: TransformedBody<CreateDishDto<DishIngredientWithoutImage>>
    ) {
        const { data, authenticatedUser } = body;

        return await this.dishCommandFacade.createDish(data, authenticatedUser);
    }

    @Put('/:encoded-dish-id')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async updateDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Body() body: EditDishBodyDto
    ): Promise<void> {
        const { data } = body;
        const dataWithImages = this.ingredientService.applyWithImages(data);

        return await this.dishCommandFacade.editDish(encodedDishId, dataWithImages);
    }

    @Delete('/:encoded-dish-id')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async deleteDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject
    ): Promise<boolean> {
        return await this.dishCommandFacade.deleteDish(encodedDishId);
    }

    @Post('/:encoded-dish-id/create')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard, CreationGuard)
    public async confirmCreatingDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Body() body: TransformedBody<null>
    ): Promise<void> {
        const { authenticatedUser } = body;

        return await this.dishCommandFacade.confirmCreating(encodedDishId, authenticatedUser);
    }

    @Post('/:encoded-dish-id/edit')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, EditionGuard)
    public async confirmEditingDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Body() body: TransformedBody<null>
    ): Promise<ConfirmedEditingDto> {
        const { authenticatedUser } = body;

        return await this.dishCommandFacade.confirmEditing(encodedDishId, authenticatedUser);
    }

    @Post('/:encoded-dish-id/delete')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, DeletionGuard)
    public async confirmDeletingDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Body() body: TransformedBody<null>
    ): Promise<ConfirmedDeletingDto> {
        const { authenticatedUser } = body;

        return await this.dishCommandFacade.confirmDeleting(encodedDishId, authenticatedUser);
    }

    @Get('/:encoded-dish-id/comments')
    @HttpCode(200)
    public async getComments(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject
    ): Promise<GetDishCommentsDto> {
        return await this.dishQueryFacade.getDishComments(encodedDishId);
    }

    @Post('/:encoded-dish-id/comment')
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async addDishComment(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Body() body: TransformedBody<CreateDishCommentBody>
    ): Promise<void> {
        const { data, authenticatedUser } = body;

        return await this.dishCommandFacade.addDishComment(encodedDishId, authenticatedUser.login, data.text);
    }

    @Get('/:encoded-dish-id/rating')
    @HttpCode(200)
    public async getRating(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject
    ): Promise<GetDishRatingDto> {
        return await this.dishQueryFacade.getDishRating(encodedDishId);
    }

    @Post('/:encoded-dish-id/rating')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async addRating(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Body() body: TransformedBody<CreateDishRatingBody>
    ): Promise<AddedDishRatingDto> {
        const { data, authenticatedUser } = body;

        return await this.dishCommandFacade.addDishRating(encodedDishId, authenticatedUser.login, data.rating);
    }

    @Get('/proposal/all')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async getDishProposal(
        @Request() req
    ): Promise<GetDishProposalsDto> {
        const { authenticatedUser } = req.body;

        return await this.dishQueryFacade.getDishProposal(authenticatedUser);
    }

    @Post('/proposal')
    @HttpCode(204)
    @UseGuards(AuthenticationGuard)
    public async addDishProposal(
        @Request() req
    ): Promise<void> {
        const { authenticatedUser, data } = req.body;
        const { ingredients } = data;

        return await this.dishCommandFacade.addDishProposal(authenticatedUser, ingredients);
    }

    @Get('/soft/added')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, CreationGuard)
    public async getSoftAddedDishes(): Promise<GetDishesDto> {
        return await this.dishQueryFacade.getDishesWithSoftAdded();
    }

    @Get('/soft/edited')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, EditionGuard)
    public async getSoftEditedDishes(): Promise<GetDishesDto> {
        return await this.dishQueryFacade.getDishesWithSoftEdited();
    }

    @Get('/soft/deleted')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard, DeletionGuard)
    public async getSoftDeletedDishes(): Promise<GetDishesDto> {
        return await this.dishQueryFacade.getDishesWithSoftDeleted();
    }
}
