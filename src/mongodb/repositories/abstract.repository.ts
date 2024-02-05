import { Document, FilterQuery, Model, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';

export abstract class AbstractRepository<T extends Document, CreateDataType> {

    protected constructor(protected readonly model: Model<T>) {}

    async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filterQuery);
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id);
    }

    async findAll(filterQuery: FilterQuery<T>): Promise<T[] | null> {
        return this.model.find(filterQuery);
    }

    async create(createData: CreateDataType): Promise<T> {
        return this.model.create(createData);
    }

    async updateOne(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T> | UpdateWithAggregationPipeline) {
        return this.model.updateOne(filterQuery, updateQuery);
    }

    async updateMany(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T> | UpdateWithAggregationPipeline) {
        return this.model.updateMany(filterQuery, updateQuery);
    }

    async deleteOne(filterQuery: FilterQuery<T>) {
        return this.model.deleteOne(filterQuery);
    }

    async deleteMany(filterQuery: FilterQuery<T>) {
        return this.model.deleteMany(filterQuery);
    }
}