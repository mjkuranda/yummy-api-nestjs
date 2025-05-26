import { Injectable } from '@nestjs/common';
import { DishSourceRegistryService } from '../source/dish-source-registry.service';
import { CreateDishDataType } from '../dish.types';
import { DishDocument } from '../../../mongodb/documents/dish.document';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { UserDto } from '../../user/user.dto';
import { EncodedDishId } from '../../../common/types';
import { DishIdObfuscator } from '../../../common/helpers/dish-id-obfuscator.helper';
import { InvalidMongooseIdError } from '../../../errors/invalid-mongoose-id.error';
import { NotFoundError } from '../../../errors/not-found.error';
import { DishCacheService } from '../../cache/dish-cache.service';
import { proceedDishDocumentToDishDetails } from '../dish.utils';
import { LoggerService } from '../../logger/logger.service';
import { BadRequestException } from '../../../exceptions/bad-request.exception';
import { DatabaseException } from '../../../exceptions/database.exception';
import { DishEditDto } from '../dish.dto';
import { DishIngredient } from '../../ingredient/ingredient.types';
import { isValidObjectId } from 'mongoose';
import { NotFoundException } from '../../../exceptions/not-found.exception';

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
        const context = 'DishWriteService/confirmCreating';
        const { dishId: id } = DishIdObfuscator.decode(encodedDishId);

        try {
            const dish = await this.dishRepository.findById(id) as DishDocument;

            await this.dishRepository.unsetSoftAdded(dish._id);

            const addedDish = await this.dishRepository.findById(dish._id) as DishDocument;
            const detailedDish = proceedDishDocumentToDishDetails(addedDish);

            await this.dishCacheService.setDishDetails(encodedDishId, detailedDish);

            this.loggerService.info(context, `Cached a dish with "${encodedDishId}" id.`);
            this.loggerService.info(context, `Dish with id "${encodedDishId}" (titled: "${dish.title}") has been confirmed adding by "${user.login}" user.`);
        } catch (err) {
            throw err;
        }
    }

    /**
     * @description inserts edited data to the dish
     * @param encodedDishId encoded dish ID with its provider
     * @param dishEditDto dish edit data
     */
    async edit(encodedDishId: EncodedDishId, dishEditDto: DishEditDto<DishIngredient>): Promise<DishDocument> {
        const context = 'DishWriteService/edit';
        const { dishId } = DishIdObfuscator.decode(encodedDishId);

        try {
            const dish = await this.dishRepository.findById(dishId) as DishDocument;

            await this.dishRepository.insertEdition(dish._id, dishEditDto);
            const editedDish = await this.dishRepository.findById(dish._id) as DishDocument;
            this.loggerService.info(context, `Dish with id "${encodedDishId}" (titled: "${dish.title}") has been edited.`);

            return editedDish;
        } catch (err) {
            throw err;
        }
    }

    async confirmEditing(id: string, user: UserDto): Promise<DishDocument> {
        const context = 'DishOrchestrator/confirmEditing';

        if (!isValidObjectId(id)) {
            const message = `Provided "${id}" that is not a correct MongoDB id.`;
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        const dish = await this.dishRepository.findById(id) as DishDocument;

        if (!dish) {
            const message = `Cannot find a dish with "${id}" id.`;
            this.loggerService.error(context, message);

            throw new NotFoundException(context, message);
        }

        await this.dishRepository.confirmEdition(id, dish.softEdited);
        const updatedDish = await this.dishRepository.findById(id) as DishDocument;
        await this.redisService.set<DishDocument>(updatedDish, 'dish');
        this.loggerService.info(context, `Cached a dish with "${dish._id}" id.`);

        this.loggerService.info(context, `Dish with id "${dish._id}" (titled: "${dish.title}") has been confirmed editing by "${user.login}" user.`);

        return updatedDish as DishDocument;
    }
}