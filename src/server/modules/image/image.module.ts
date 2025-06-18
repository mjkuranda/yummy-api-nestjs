import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';

@Module({
    imports: [],
    controllers: [ImageController],
    providers: [ImageService, JwtManagerService],
    exports: [JwtManagerService]
})
export class ImageModule {}