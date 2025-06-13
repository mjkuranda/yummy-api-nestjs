import { loadDataFile } from '../../common/utils';
import { getFulfilledPromiseResults } from '../../utils';
import { Injectable } from '@nestjs/common';

// FIXME: Deprecated
@Injectable()
export class DishCommonService {

    constructor(private readonly dishRepository: DishRepository) {}

    // TODO: Change to cron or initial
    async addInitialDishes(): Promise<void> {
        const data = await loadDataFile<DishDocument[]>('initial-dishes');

        await this.dishRepository.insertMany(data);
    }

    getDatasets<T>(...datasets: Promise<T>[]): Promise<T[]> {
        return getFulfilledPromiseResults<T>(datasets);
    }
}