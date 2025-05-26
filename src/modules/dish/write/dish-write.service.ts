import { Injectable } from '@nestjs/common';
import { DishSourceRegistryService } from '../source/dish-source-registry.service';
import { CreateDishDataType } from '../dish.types';
import { DishDocument } from '../../../mongodb/documents/dish.document';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { UserDto } from '../../user/user.dto';
import { isValidObjectId } from 'mongoose';
import { EncodedDishId } from '../../../common/types';
import { DishIdObfuscator } from '../../../common/helpers/dish-id-obfuscator.helper';
import { InvalidMongooseIdError } from '../../../errors/invalid-mongoose-id.error';
import { NotFoundError } from '../../../errors/not-found.error';
import { DishCacheService } from '../../cache/dish-cache.service';
import { proceedDishDocumentToDishDetails } from '../dish.utils';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class DishWriteService {

    private readonly dishRepository: DishRepository;

    constructor(private readonly dishSourceRegistryService: DishSourceRegistryService,
                private readonly dishCacheService: DishCacheService,
                private readonly loggerService: LoggerService) {
        this.dishRepository = this.dishSourceRegistryService.getDishRepositoryProvider();
    }

    /**
     * @description creates and saves a new dish to the database
     * @param createData includes data to create a new dish
     */
    async saveNewDish(createData: CreateDishDataType): Promise<DishDocument> {
        return await this.dishRepository.create(createData);
    }

    /**
     * @description confirms creating a new dish
     * @param encodedDishId encoded dish id with its provider name
     * @param user user DTO // TODO: Change this. Too much information
     */
    async confirmCreating(encodedDishId: EncodedDishId, user: UserDto): Promise<void> {
        const context = 'DishService/confirmCreating';
        const { dishId: id } = DishIdObfuscator.decode(encodedDishId);

        if (!isValidObjectId(id)) {
            throw new InvalidMongooseIdError(`Provided "${encodedDishId}" that is not a correct MongoDB id.`);
        }

        const dish = await this.dishRepository.findById(id) as DishDocument;

        if (!dish) {
            throw new NotFoundError(`Cannot find a dish with "${encodedDishId}" id.`);
        }

        await this.dishRepository.unsetSoftAdded(dish._id);

        const addedDish = await this.dishRepository.findById(dish._id) as DishDocument;
        const detailedDish = proceedDishDocumentToDishDetails(addedDish);
        await this.dishCacheService.setDishDetails(encodedDishId, detailedDish);

        this.loggerService.info(context, `Cached a dish with "${encodedDishId}" id.`);
        this.loggerService.info(context, `Dish with id "${encodedDishId}" (titled: "${dish.title}") has been confirmed adding by "${user.login}" user.`);
    }
}