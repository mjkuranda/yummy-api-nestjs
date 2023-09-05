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

describe('AuthService', () => {
    let service: AuthService;
    let model: Model<UserDocument>;
    let mongod: MongoMemoryServer;
    let mongoConnection: Connection;

    const mockAuthService = {};

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

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
