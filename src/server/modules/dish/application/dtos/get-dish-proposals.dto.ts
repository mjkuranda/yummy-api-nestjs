import { DishProposalDto } from './dish-proposal.dto';

export class GetDishProposalsDto {

    constructor(
        public readonly proposals: DishProposalDto[]
    ) {}

}