import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { ForbiddenException, NotFoundException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { PermissionManagementService } from '../../domain/services';
import { NoSuchCapabilityError, UserWithLoginNotFoundError } from '../../domain/errors';
import { CapabilityType } from '../../domain/types';
import { InvalidMongooseObjectIdError } from '../../../../common/errors';

export class DenyPermissionUseCase extends AbstractUseCase<[string, string, CapabilityType], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly permissionManagementService: PermissionManagementService
    ) {
        super();
    }

    protected async run(denierLogin: string, targetLogin: string, capability: CapabilityType): Promise<void> {
        await this.permissionManagementService.denyPermission(denierLogin, targetLogin, capability);

        const message = `Permission "${capability}" has been taken by user "${denierLogin}" to user "${targetLogin}".`;
        this.loggerService.info(this.context, message);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof InvalidMongooseObjectIdError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof UserWithLoginNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof NoSuchCapabilityError) {
            throw new ForbiddenException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'DenyPermissionUseCase/run';
    }
}