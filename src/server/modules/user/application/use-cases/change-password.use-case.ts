import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { NotFoundException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { UserWithLoginNotFoundError } from '../../domain/errors';
import { UserManagementService } from '../../domain/services/user-management.service';
import { InvalidMongooseObjectIdError } from '../../../../common/errors';

export class ChangePasswordUseCase extends AbstractUseCase<[string, string], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly userManagementService: UserManagementService
    ) {
        super();
    }

    protected async run(userId: string, newPassword: string): Promise<void> {
        await this.userManagementService.changePassword(userId, newPassword);

        this.loggerService.info(this.context, `Password changed successfully for user with ID "${userId}"`);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof InvalidMongooseObjectIdError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof UserWithLoginNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'ChangePasswordUseCase/run';
    }
}