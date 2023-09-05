import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { connect, Connection, Model } from 'mongoose';
import { UserDocument } from '../user/user.interface';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { UserService } from '../user/user.service';
import { LoggerService } from '../logger/logger.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { of } from 'rxjs';

// https://betterprogramming.pub/testing-controllers-in-nestjs-and-mongo-with-jest-63e1b208503c
// https://stackoverflow.com/questions/74110962/please-make-sure-that-the-argument-databaseconnection-at-index-0-is-available

describe('AuthService', () => {
    let service: AuthService;
    let model: Model<UserDocument>;
    let mongod: MongoMemoryServer;
    let mongoConnection: Connection;

    beforeEach(async() => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        mongoConnection = (await connect(uri)).connection;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtManagerService,
                    useValue: {
                        get: () => of({ data: [] })
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        get: () => of({ data: [] })
                    }
                },
                {
                    provide: LoggerService,
                    useValue: {
                        get: () => of({ data: [] })
                    }
                },
                {
                    provide: getModelToken(models.USER_MODEL),
                    useValue: {
                        get: () => of({ data: [] })
                    }
                }
            ],
        }).compile();

        service = module.get<AuthService>(AuthService) as AuthService;
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
        expect(service).toBeDefined();
    });

    const mockAuthService = {
        getAuthorizedUser: jest.fn()
    };

    const mockUser = {
        _id: '64e9f765d4e60ba693641aa1',
        login: 'Test',
        password: '$2b$12$r.ea/uOV1ZE6XWinWC8RY.l08EjrAQMx2shhcZwwrc1TIj8nAddry' // 123
    } as UserDocument & { _id: string };

    it('should get authorized user', async() => {
        jest.spyOn(model, 'getAuthorizedUser').mockResolvedValue(mockUser);
    });
});
