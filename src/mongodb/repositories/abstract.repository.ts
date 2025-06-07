import {
    Document,
    FilterQuery,
    isValidObjectId,
    Model,
    PipelineStage,
    UpdateQuery,
    UpdateWithAggregationPipeline
} from 'mongoose';
import { DeleteResult } from 'mongodb';
import { InvalidMongooseObjectIdError } from '../../errors/infrastructure';

export abstract class AbstractRepository<T extends Document, CreateDataType> {

    protected constructor(protected readonly model: Model<T>) {}

    async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filterQuery);
    }

    async findById(id: string): Promise<T | null> {
        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        const document = await this.model.findById(id) as T | null;

        return document;
    }

    async findAll(filterQuery: FilterQuery<T>, limit?: number): Promise<T[] | null> {
        if (limit) {
            return this.model.find(filterQuery).limit(limit);
        }

        return this.model.find(filterQuery);
    }

    async create(createData: CreateDataType): Promise<T> {
        return this.model.create(createData);
    }

    async insertMany(data: T[]) {
        return this.model.insertMany(data);
    }

    async updateOne(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T> | UpdateWithAggregationPipeline) {
        return this.model.updateOne(filterQuery, updateQuery);
    }

    async updateMany(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T> | UpdateWithAggregationPipeline) {
        return this.model.updateMany(filterQuery, updateQuery);
    }

    async updateAndReturnDocument(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
        return this.model.findOneAndUpdate(filterQuery, updateQuery, { new: true });
    }

    async deleteOne(filterQuery: FilterQuery<T>): Promise<DeleteResult> {
        return this.model.deleteOne(filterQuery);
    }

    async deleteMany(filterQuery: FilterQuery<T>): Promise<DeleteResult> {
        return this.model.deleteMany(filterQuery);
    }

    async calculateAverage(pipeline: PipelineStage[]) {
        return this.model.aggregate(pipeline);
    }
}