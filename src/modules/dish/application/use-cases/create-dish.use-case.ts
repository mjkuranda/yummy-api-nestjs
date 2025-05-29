import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { CreateDishDto } from '../../dish.dto';
import { DishIngredientWithoutImage } from '../../../ingredient/ingredient.types';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { DishProvider } from '../../../../common/enums';
import { DishWriteService } from '../../write/dish-write.service';
import { IngredientService } from '../../../ingredient/ingredient.service';
import { LoggerService } from '../../../logger/logger.service';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateDishUseCase extends AbstractUseCase<[CreateDishDto<DishIngredientWithoutImage>, UserAccessTokenPayload], DishDocument> {
    private getCurrentTimestamp: () => number = Date.now;

    constructor(
        private readonly dishWriteService: DishWriteService,
        private readonly ingredientService: IngredientService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    // For testing purposes only
    setTimestampProvider(provider: () => number) {
        this.getCurrentTimestamp = provider;
    }

    async execute(createDishDto: CreateDishDto<DishIngredientWithoutImage>, user: UserAccessTokenPayload): Promise<DishDocument> {
        const context = 'CreateDishUseCase/execute';
        const { ingredients, title, imageUrl, ingredientCount } = createDishDto;
        const imageUrlDescription = imageUrl ? `"${imageUrl}" image url` : 'no image';

        try {
            const ingredientList = await this.ingredientService.wrapIngredientsWithImages(ingredients);

            if (!ingredientList || ingredientList.length === 0) {
                throw new BadRequestException(context, 'Cannot create dish without ingredients');
            }

            const createdDish = await this.dishWriteService.saveNewDish({
                ...createDishDto,
                ingredients: ingredientList,
                author: user.login,
                posted: this.getCurrentTimestamp(),
                provider: DishProvider.INT_DMT_USER,
                softAdded: true
            });

            const message = `New dish "${title}", having ${ingredientCount} ingredients and with ${imageUrlDescription} has been created by ${user.login}.`;
            this.loggerService.info(context, message);

            return createdDish;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
        }
    }
}