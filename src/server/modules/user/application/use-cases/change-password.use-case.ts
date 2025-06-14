import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { NotFoundException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { UserManagementService } from '../../domain/services/user-management.service';

export class ChangePasswordUseCase extends AbstractUseCase<[string, string], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly userManagementService: UserManagementService
    ) {
        super();
    }

    protected async run(userLogin: string, newPassword: string): Promise<void> {
        await this.userManagementService.changePassword(userLogin, newPassword);

        this.loggerService.info(this.context, `Password changed successfully for user with login "${userLogin}"`);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof Error && error.message.includes('not found')) {
            throw new NotFoundException(context, error.message);
        }
        throw error;
    }

    protected get context(): ContextString {
        return 'ChangePasswordUseCase/run';
    }
}