import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { CreateDishDto } from '../../dish.dto';
import { DishIngredientWithoutImage } from '../../../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { DishWriteService } from '../../write/dish-write.service';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { LoggerService } from '../../../logger/logger.service';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { Injectable } from '@nestjs/common';
import { EmptyDishIngredientListError, MissingDishAuthorError } from '../../../../errors/domain';

@Injectable()
export class CreateDishUseCase extends AbstractUseCase<[CreateDishDto<DishIngredientWithoutImage>, UserAccessTokenPayload], DishDocument> {

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly ingredientService: IngredientService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    async execute(createDishDto: CreateDishDto<DishIngredientWithoutImage>, user: UserAccessTokenPayload): Promise<DishDocument> {
        const context = 'CreateDishUseCase/execute';
        const { ingredients, title, imageUrl, ingredientCount } = createDishDto;
        const imageUrlDescription = imageUrl ? `"${imageUrl}" image url` : 'no image';

        try {
            const ingredientList = await this.ingredientService.wrapIngredientsWithImages(ingredients);
            const createdDish = await this.dishWriteService.saveNewDish(createDishDto, user.login, ingredientList);
            const message = `New dish "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription} has been created by ${user.login}.`;

            this.loggerService.info(context, message);

            return createdDish;
        } catch (error: unknown) {
            if (error instanceof MissingDishAuthorError) {
                throw new BadRequestException(context, error.message);
            }

            if (error instanceof EmptyDishIngredientListError) {
                throw new BadRequestException(context, error.message);
            }
        }
    }
}