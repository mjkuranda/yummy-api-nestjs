import { Test, TestingModule } from '@nestjs/testing';
import { JwtManagerService } from './jwt-manager.service';

describe('JwtManagerService', () => {
  let service: JwtManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtManagerService],
    }).compile();

    service = module.get<JwtManagerService>(JwtManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
