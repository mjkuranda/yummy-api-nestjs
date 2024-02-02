// mongodb-memory-test.module.ts
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DynamicModule, Module } from '@nestjs/common';
import { UserService } from './modules/user/user.service';

@Module({})
export class MongodbMemoryTestModule {
    static forRoot(): DynamicModule {
        return {
            module: MongodbMemoryTestModule,
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: async () => {
                        const mongod = await MongoMemoryServer.create({ instance: { dbPath: '/home/mkuranda/Programming/Projects/yummy-api-nestjs/db' }});
                        const uri = mongod.getUri();

                        return {
                            uri,
                            useNewUrlParser: true,
                            useUnifiedTopology: true,
                        };
                    },
                }),
            ],
            // providers: [UserService],
        };
    }
}