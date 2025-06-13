import { DishProposalDto, GetDishProposalsDto } from '../dtos';
import { DishProposalValueObject } from '../../domain/read/value-objects';

export class DishProposalsDtoMapper {

    static toGetDishProposalsDto(dishProposalVos: DishProposalValueObject[]): GetDishProposalsDto {
        const proposals = dishProposalVos.map(vo =>
            new DishProposalDto(
                vo.encodedDishIdVo.getValue(),
                vo.title,
                vo.recommendationPoints,
                vo.imgUrl
            )
        );

        return new GetDishProposalsDto(proposals);
    }
}