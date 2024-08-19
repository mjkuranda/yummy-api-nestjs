import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '../exceptions/bad-request.exception';
import { ContextString } from '../common/types';
import { LoggerService } from '../modules/logger/logger.service';
import { MEGABYTE } from '../constants/sizes.constant';
import { ImageValue } from '../modules/image/image.types';

@Injectable()
export class ImageUploadValidationPipe implements PipeTransform {

    constructor(private readonly loggerService: LoggerService) {}

    async transform(value: ImageValue): Promise<ImageValue> {
        const context: ContextString = 'ImageUploadValidationPipe/transform';

        if (!value) {
            const message = 'File is required';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        if (!['image/jpeg', 'image/png', 'image/png'].includes(value.mimetype)) {
            const message = 'Invalid file type';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        if (value.size > 0.5 * MEGABYTE) {
            const message = 'File is too large';
            this.loggerService.error(context, message);

            throw new BadRequestException(context, message);
        }

        return value;
    }
}