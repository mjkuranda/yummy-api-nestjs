import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { LoggerService } from '../../../logger/logger.service';
import { DishWriteService } from '../../write/dish-write.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddDishProposalsUseCase extends AbstractUseCase<[UserAccessTokenPayload, string[]], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly dishWriteService: DishWriteService
    ) {
        super();
    }

    async execute(user: UserAccessTokenPayload, ingredients: string[]): Promise<void> {
        await this.dishWriteService.addDishProposal(user.login, ingredients);
        this.loggerService.info('AddDishProposalsUseCase/execute', `Added search query for user ${user.login}.`);
    }

}