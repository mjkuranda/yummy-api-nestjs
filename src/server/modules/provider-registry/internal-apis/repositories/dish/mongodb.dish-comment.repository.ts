import { DishCommentDocument } from '../../../../../../infrastructure/databases/mongodb/documents';
import { InjectModel } from '@nestjs/mongoose';
import { dishCommentModel } from '../../../../../common/definitions/mongoose-model.definitions';
import { isValidObjectId, Model } from 'mongoose';
import { DishId } from '../../../../../common/types';
import { DishCommentEntity } from '../../../../dish/domain/common/entities';
import { DishCommentFactory } from '../../../../dish/domain/common/factories';
import { DishCommentRepository } from '../../../../dish/domain/common/repositories';
import { InvalidMongooseIdTypeError, InvalidMongooseObjectIdError } from '../../../../../common/errors';

export class MongodbDishCommentRepository implements DishCommentRepository {

    constructor(
        @InjectModel(dishCommentModel.name) private readonly model: Model<DishCommentDocument>
    ) {}

    async postNewComment(userLogin: string, text: string, dishId: DishId): Promise<void> {
        if (typeof dishId !== 'string') {
            throw new InvalidMongooseIdTypeError(dishId);
        }

        if (!isValidObjectId(dishId)) {
            throw new InvalidMongooseObjectIdError(dishId);
        }

        await this.model.create({
            dishId,
            text,
            user: userLogin,
            posted: Date.now()
        });
    }

    async getAllComments(dishId: DishId, limit?: number): Promise<DishCommentEntity[]> {
        if (typeof dishId !== 'string') {
            throw new InvalidMongooseIdTypeError(dishId);
        }

        if (!isValidObjectId(dishId)) {
            throw new InvalidMongooseObjectIdError(dishId);
        }

        const docs = await this.model.find({ dishId }).limit(limit ?? 1000);

        return DishCommentFactory.fromDocuments(docs);
    }

    async deleteAllComments(dishId: DishId): Promise<void> {
        if (typeof dishId !== 'string') {
            throw new InvalidMongooseIdTypeError(dishId);
        }

        if (!isValidObjectId(dishId)) {
            throw new InvalidMongooseObjectIdError(dishId);
        }

        await this.model.deleteMany({ dishId });
    }
}