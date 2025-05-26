import { loadDataFile } from '../../common/utils';
import { DishDocument } from '../../mongodb/documents/dish.document';
import { getFulfilledPromiseResults } from '../../utils';
import { Injectable } from '@nestjs/common';
import { DishRepository } from '../../mongodb/repositories/dish.repository';

// FIXME: Deprecated
@Injectable()
export class DishCommonService {

    constructor(private readonly dishRepository: DishRepository) {}

    async addInitialDishes(): Promise<void> {
        const data = await loadDataFile<DishDocument[]>('initial-dishes');

        await this.dishRepository.insertMany(data);
    }

    getDatasets<T>(...datasets: Promise<T>[]): Promise<T[]> {
        return getFulfilledPromiseResults<T>(datasets);
    }
}