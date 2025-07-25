import { DishProposalDto, GetDishProposalsDto } from '../dtos';
import { DishProposalVo } from '../../domain/read/vos';

export class DishProposalsDtoMapper {

    static toGetDishProposalsDto(encodedDishIds: string[], dishProposalVos: DishProposalVo[]): GetDishProposalsDto {
        const proposals = dishProposalVos.map((vo, idx) =>
            new DishProposalDto(
                encodedDishIds[idx],
                vo.title,
                vo.recommendationPoints,
                vo.imgUrl
            )
        );

        return new GetDishProposalsDto(proposals);
    }
}