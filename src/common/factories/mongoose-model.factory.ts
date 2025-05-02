import { Schema } from 'mongoose';
import { ModelDefinition } from '@nestjs/mongoose';

export class MongooseModelFactory {

    static create(name: string, schema: Schema): ModelDefinition {
        return {
            name,
            schema,
            collection: name
        };
    }
}
