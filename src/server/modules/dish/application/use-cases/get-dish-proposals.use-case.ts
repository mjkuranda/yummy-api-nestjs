import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { DishReadService } from '../../domain/read/dish-read.service';
import { LoggerService } from '../../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { BadRequestException } from '../../../../exceptions';
import { GetDishProposalsDto } from '../dtos';
import { DishProposalsDtoMapper } from '../mappers';

@Injectable()
export class GetDishProposalsUseCase extends AbstractUseCase<[UserAccessTokenPayload], GetDishProposalsDto> {

    constructor(
        private readonly dishReadService: DishReadService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(user: UserAccessTokenPayload): Promise<GetDishProposalsDto> {
        const dishProposals = await this.dishReadService.getDishProposals(user.login);

        this.loggerService.info(this.context, `Generated ${dishProposals.length} dish proposal${dishProposals.length > 1 || dishProposals.length === 0 ? 's' : ''}.`);

        return DishProposalsDtoMapper.toGetDishProposalsDto(dishProposals);
    }

    protected handleError(error: unknown, context: ContextString): never {
        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'GetDishProposalsUseCase/run';
    }
}