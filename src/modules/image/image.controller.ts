import { Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageInterceptor } from '../../interceptors/image.interceptor';

@Controller('images')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Post('upload')
    @HttpCode(201)
    @UseInterceptors(ImageInterceptor)
    public postImage(@UploadedFile() file: Express.Multer.File): string {
        return this.imageService.saveFile(file);
    }
}