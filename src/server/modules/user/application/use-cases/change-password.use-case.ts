import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { BadRequestException, NotFoundException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { UserPasswordService } from '../../domain/services/user-password.service';
import { UserWithLoginNotFoundError } from '../../../../errors/domain';
import { InvalidMongooseObjectIdError } from '../../../../errors/infrastructure';

export class ChangePasswordUseCase extends AbstractUseCase<[string, string], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly userPasswordService: UserPasswordService
    ) {
        super();
    }

    protected async run(userId: string, newPassword: string): Promise<void> {
        await this.userPasswordService.changePassword(userId, newPassword);

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