import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let imageService: ImageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageService],
        }).compile();

        imageService = module.get<ImageService>(ImageService);
    });

    it('should be defined', () => {
        expect(imageService).toBeDefined();
    });

    describe('saveFile', () => {
        it('should return the filename of the provided file', () => {
            const file = { filename: 'test-image.jpg' } as Express.Multer.File;

            const result = imageService.saveFile(file);

            expect(result).toBe('test-image.jpg');
        });
    });
});