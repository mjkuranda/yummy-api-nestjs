import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { NotFoundException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { UserActivationService } from '../../domain/services/user-activation.service';

export class ActivateUserUseCase extends AbstractUseCase<[string], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly userActivationService: UserActivationService
    ) {
        super();
    }

    protected async run(userActionId: string): Promise<void> {
        await this.userActivationService.activate(userActionId);

        this.loggerService.info(this.context, `User activated successfully with action ID "${userActionId}"`);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof Error && error.message.includes('not found')) {
            throw new NotFoundException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'ActivateUserUseCase/run';
    }
}