import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {

    saveFile(file: Express.Multer.File): string {
        return file.filename;
    }
}