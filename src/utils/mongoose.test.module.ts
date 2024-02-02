import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as path from 'path';

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) => MongooseModule.forRootAsync({
    useFactory: async () => {
        const dbPath = '/home/mkuranda/Programming/Projects/yummy-api-nestjs/db';
        // const dbPath = path.resolve(__dirname, 'db');
        mongod = await MongoMemoryServer.create({
            instance: {
                dbName: 'myDB',
                storageEngine: 'wiredTiger',
                dbPath: dbPath,
            }
        });
        const mongoUri = mongod.getUri();

        return {
            uri: mongoUri,
            ...options,
        };
    },
});

export const closeInMongodConnection = async () => {
    if (mongod) await mongod.stop();
};
