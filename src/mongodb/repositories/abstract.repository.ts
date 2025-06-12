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
import { InvalidMongooseIdTypeError, InvalidMongooseObjectIdError } from '../../errors/infrastructure';
import { DishId } from '../../modules/dish/dish.types';

export abstract class AbstractRepository<DocumentType extends Document, CreateDataType> {

    protected constructor(protected readonly model: Model<DocumentType>) {}

    async findOne(filterQuery: FilterQuery<DocumentType>): Promise<DocumentType | null> {
        return this.model.findOne(filterQuery);
    }

    async findById(id: DishId): Promise<DocumentType | null> {
        if (typeof id !== 'string') {
            throw new InvalidMongooseIdTypeError(id);
        }

        if (!isValidObjectId(id)) {
            throw new InvalidMongooseObjectIdError(id);
        }

        const document = await this.model.findById(id) as DocumentType | null;

        return document;
    }

    async findAll(filterQuery: FilterQuery<DocumentType>, limit?: number): Promise<DocumentType[] | null> {
        if (limit) {
            return this.model.find(filterQuery).limit(limit);
        }

        return this.model.find(filterQuery);
    }

    async create(createData: CreateDataType): Promise<DocumentType> {
        return this.model.create(createData);
    }

    async insertMany(data: DocumentType[]) {
        return this.model.insertMany(data);
    }

    async updateOne(filterQuery: FilterQuery<DocumentType>, updateQuery: UpdateQuery<DocumentType> | UpdateWithAggregationPipeline) {
        return this.model.updateOne(filterQuery, updateQuery);
    }

    async updateMany(filterQuery: FilterQuery<DocumentType>, updateQuery: UpdateQuery<DocumentType> | UpdateWithAggregationPipeline) {
        return this.model.updateMany(filterQuery, updateQuery);
    }

    async updateAndReturnDocument(filterQuery: FilterQuery<DocumentType>, updateQuery: UpdateQuery<DocumentType>) {
        return this.model.findOneAndUpdate(filterQuery, updateQuery, { new: true });
    }

    async deleteOne(filterQuery: FilterQuery<DocumentType>): Promise<DeleteResult> {
        return this.model.deleteOne(filterQuery);
    }

    async deleteMany(filterQuery: FilterQuery<DocumentType>): Promise<DeleteResult> {
        return this.model.deleteMany(filterQuery);
    }

    async calculateAverage(pipeline: PipelineStage[]) {
        return this.model.aggregate(pipeline);
    }
}