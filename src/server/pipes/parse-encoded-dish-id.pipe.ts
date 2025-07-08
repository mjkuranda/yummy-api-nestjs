import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '../exceptions';
import { EncodedDishIdVo } from '../modules/dish/domain/common/vos';

@Injectable()
export class ParseEncodedDishIdPipe implements PipeTransform {

    transform(value: string): EncodedDishIdVo {
        const encodedDishId = EncodedDishIdVo.fromEncodedString(value);

        if (!encodedDishId) {
            throw new BadRequestException('ParseEncodedDishIdPipe/transform', `Invalid "${value}" encodedDishId.`);
        }

        return encodedDishId;
    }

}