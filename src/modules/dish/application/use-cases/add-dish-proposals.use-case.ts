import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../domain/write/dish-write.service';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';

@Injectable()
export class AddDishProposalsUseCase extends AbstractUseCase<[UserAccessTokenPayload, string[]], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    protected async run(user: UserAccessTokenPayload, ingredients: string[]): Promise<void> {
        await this.dishWriteService.addDishProposal(user.login, ingredients);
        this.loggerService.info(this.context, `Added search query for user ${user.login}.`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleError(error: unknown, context: ContextString): never {
        throw error;
    }

    protected get context(): ContextString {
        return 'AddDishProposalsUseCase/run';
    }
}