import { Injectable, PipeTransform } from '@nestjs/common';
import { EncodedDishId } from '../modules/dish/domain/common/encoded-dish-id.value-object';
import { BadRequestException } from '../exceptions';

@Injectable()
export class ParseEncodedDishIdPipe implements PipeTransform {

    transform(value: string): EncodedDishId {
        const encodedDishId = EncodedDishId.fromEncodedString(value);

        if (!encodedDishId) {
            throw new BadRequestException('ParseEncodedDishIdPipe/transform', `Invalid "${value}" encodedDishId.`);
        }

        return encodedDishId;
    }

}