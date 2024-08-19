import { Controller, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageInterceptor } from '../../interceptors/image.interceptor';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { CreationGuard } from '../../guards/creation.guard';
import { ImageUploadValidationPipe } from '../../pipes/upload-image-validation.pipe';

@Controller('images')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Post('upload')
    @HttpCode(201)
    @UsePipes(ImageUploadValidationPipe)
    @UseGuards(AuthenticationGuard, CreationGuard)
    @UseInterceptors(ImageInterceptor)
    public postImage(@UploadedFile() file: Express.Multer.File): string {
        return this.imageService.saveFile(file);
    }
}