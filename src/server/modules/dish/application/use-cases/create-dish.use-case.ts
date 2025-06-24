import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { CreateDishDto } from '../../dish.dto';
import { DishIngredientWithoutImage } from '../../../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { LoggerService } from '../../../logger/logger.service';
import { BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { EmptyDishIngredientListError, MissingDishAuthorError } from '../../domain/errors';
import { ContextString } from '../../../../common/types';
import { CreatedDishDto } from '../dtos';

@Injectable()
export class CreateDishUseCase extends AbstractUseCase<[CreateDishDto<DishIngredientWithoutImage>, UserAccessTokenPayload], CreatedDishDto> {

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly ingredientService: IngredientService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(createDishDto: CreateDishDto<DishIngredientWithoutImage>, user: UserAccessTokenPayload): Promise<CreatedDishDto> {
        const { ingredients, title, imageUrl, ingredientCount } = createDishDto;
        const imageUrlDescription = imageUrl ? `"${imageUrl}" image url` : 'no image';

        const ingredientList = await this.ingredientService.wrapIngredientsWithImages(ingredients);
        const createdDish = await this.dishWriteService.saveNewDish(createDishDto, user.login, ingredientList);
        const message = `New dish "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription} has been created by ${user.login}.`;

        this.loggerService.info(this.context, message);

        return createdDish;
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof MissingDishAuthorError) {
            throw new BadRequestException(context, error.message);
        }

        if (error instanceof EmptyDishIngredientListError) {
            throw new BadRequestException(context, error.message);
        }

        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'CreateDishUseCase/run';
    }
}