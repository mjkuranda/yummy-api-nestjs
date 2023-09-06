import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { connect, Connection, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { IngredientController } from './ingredient.controller';
import { IngredientDocument } from './ingredient.interface';
import { IngredientService } from './ingredient.service';
import { LoggerService } from '../logger/logger.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('IngredientController', () => {
    let controller: IngredientController;
    let model: Model<IngredientDocument>;
    let mongod: MongoMemoryServer;
    let mongoConnection: Connection;

    beforeEach(async() => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        mongoConnection = (await connect(uri)).connection;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [IngredientController],
            providers: [
                IngredientService,
                {
                    provide: getModelToken(models.INGREDIENT_MODEL),
                    useValue: Model
                },
                {
                    provide: getModelToken(models.USER_MODEL),
                    useValue: Model
                },
                {
                    provide: LoggerService,
                    useValue: {
                        info: jest.fn(),
                        error: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get(IngredientController);
        model = module.get(getModelToken(models.USER_MODEL));
    });

    afterAll(async() => {
        await mongoConnection.dropDatabase();
        await mongoConnection.close();
        await mongod.stop();
    });

    afterEach(async() => {
        const collections = mongoConnection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
