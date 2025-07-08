import { DishProposalDto, GetDishProposalsDto } from '../dtos';
import { DishProposalVo } from '../../domain/read/vos';

export class DishProposalsDtoMapper {

    static toGetDishProposalsDto(dishProposalVos: DishProposalVo[]): GetDishProposalsDto {
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