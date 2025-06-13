import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '../exceptions';
import { EncodedDishIdValueObject } from '../modules/dish/domain/common/value-objects';

@Injectable()
export class ParseEncodedDishIdPipe implements PipeTransform {

    transform(value: string): EncodedDishIdValueObject {
        const encodedDishId = EncodedDishIdValueObject.fromEncodedString(value);

        if (!encodedDishId) {
            throw new BadRequestException('ParseEncodedDishIdPipe/transform', `Invalid "${value}" encodedDishId.`);
        }

        return encodedDishId;
    }

}