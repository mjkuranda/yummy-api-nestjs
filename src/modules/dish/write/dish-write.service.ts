import { Injectable } from '@nestjs/common';
import { DishSourceRegistryService } from '../source/dish-source-registry.service';
import { CreateDishDataType } from '../dish.types';
import { DishDocument } from '../../../mongodb/documents/dish.document';

@Injectable()
export class DishWriteService {

    constructor(private readonly dishSourceRegistryService: DishSourceRegistryService) {}

    async saveNewDish(createData: CreateDishDataType): Promise<DishDocument> {
        const dishRepository = this.dishSourceRegistryService.getDishRepositoryProvider();

        return await dishRepository.create(createData);
    }
}