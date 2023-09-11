import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { connect, Connection, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { IngredientController } from './ingredient.controller';
import { IngredientDocument } from './ingredient.interface';
import { IngredientService } from './ingredient.service';
import { LoggerService } from '../logger/logger.service';

describe('IngredientController', () => {
    let controller: IngredientController;
    let service: IngredientService;
    let model: Model<IngredientDocument>;
    let mongod: MongoMemoryServer;
    let mongoConnection: Connection;

    const mockIngredients = [
        {
            _id: '64e771c9cc3fd92ab24f1bc0',
            name: 'ingredient name',
            category: 'category name'
        },
        {
            _id: '64e771c9cc3fd92ab24f1bc1',
            name: 'ingredient name 2',
            category: 'category name'
        }
    ];

    const mockIngredientService = {
        findAll: jest.fn().mockResolvedValueOnce(mockIngredients),
        create: jest.fn()
    };

    beforeEach(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        mongoConnection = (await connect(uri)).connection;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [IngredientController],
            providers: [
                {
                    provide: IngredientService,
                    useValue: mockIngredientService
                },
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
                },
                // {
                //     provide: REDIS_CLIENT,
                //     useValue: {}
                // }
            ]
        }).compile();

        controller = module.get(IngredientController);
        service = module.get(IngredientService);
        model = module.get(getModelToken(models.USER_MODEL));
    });

    afterAll(async () => {
        await mongoConnection.dropDatabase();
        await mongoConnection.close();
        await mongod.stop();
    });

    afterEach(async () => {
        const collections = mongoConnection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get all ingredients', async () => {
        const result = await controller.getIngredients();

        expect(service.findAll).toHaveBeenCalled();
        expect(result).toBe(mockIngredients);
    });

    it('should create a new ingredient', async () => {
        const newIngredient = {
            name: 'Awesome ingredient',
            category: 'Some category'
        };
        const mockIngredient = { ...newIngredient };
        mockIngredientService.create = jest.fn().mockResolvedValueOnce(mockIngredient);

        const result = await service.create(newIngredient);

        expect(service.create).toHaveBeenCalled();
        expect(result).toBe(mockIngredient);
    });
});
