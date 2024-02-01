import { Document, FilterQuery, Model } from 'mongoose';

export class AbstractRepository<T extends Document> {

    constructor(private readonly model: Model<T>) {}

    async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filterQuery);
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id);
    }

    async find(filterQuery: FilterQuery<T>): Promise<T[] | null> {
        return this.model.find(filterQuery);
    }

    async create(createData: unknown): Promise<T> {
        return this.model.create(createData);
    }
}