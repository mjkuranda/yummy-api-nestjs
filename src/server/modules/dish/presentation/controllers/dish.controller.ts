import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    UseGuards, UseInterceptors,
    UsePipes
} from '@nestjs/common';
import { DishQueryFacade } from '../../application/dish-query.facade';
import { DishCommandFacade } from '../../application/dish-command.facade';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { DishQueryValidationPipe } from '../../../../pipes/dish-query-validation.pipe';
import { EditDishDto, GetDishDetailsDto, GetDishResultsDto } from '../../application/dtos';
import { AuthenticationGuard } from '../../../../guards/authentication.guard';
import { CreateDishDto } from '../../application/dtos';
import { DishIngredientWithoutImage } from '../../../ingredient/ingredient.types';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { Language } from '../../../../common/types';
import { AddUserQueryInterceptor } from '../interceptors';
import { GetDishesQueryDto } from '../../application/dtos/get-dishes-query.dto';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { User } from '../../../../decorators';

@Controller('dishes')
export class DishController {

    constructor(
        private readonly dishQueryFacade: DishQueryFacade,
        private readonly dishCommandFacade: DishCommandFacade,
        private readonly ingredientService: IngredientService
    ) {}

    @Post()
    @HttpCode(201)
    @UseGuards(AuthenticationGuard)
    public async createDish(
        @User() user: UserAccessTokenPayload,
        @Body() body: CreateDishDto<DishIngredientWithoutImage>
    ) {
        return await this.dishCommandFacade.createDish(body, user);
    }

    @Get()
    @HttpCode(200)
    @UseGuards(OptionalAuthGuard)
    @UsePipes(DishQueryValidationPipe)
    @UseInterceptors(AddUserQueryInterceptor)
    public async getDishes(
        @Query() getDishesQueryDto: GetDishesQueryDto
    ): Promise<GetDishResultsDto> {
        return await this.dishQueryFacade.getDishes(getDishesQueryDto);
    }

    @Get('/:encoded-dish-id/details')
    @HttpCode(200)
    public async getDishDetails(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Headers('accept-language') language: Language = 'pl'
    ): Promise<GetDishDetailsDto> {
        return await this.dishQueryFacade.getDishDetails(encodedDishId, language);
    }

    @Put('/:encoded-dish-id')
    @HttpCode(200)
    @UseGuards(AuthenticationGuard)
    public async updateDish(
        @Param('encoded-dish-id') encodedDishId: EncodedDishIdValueObject,
        @Body() body: EditDishDto<DishIngredientWithoutImage>
    ): Promise<void> {
        const dataWithImages = this.ingredientService.applyWithImages(body);

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

}