import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { ForbiddenException, NotFoundException } from '../../../../exceptions';
import { CapabilityType } from '../../user.types';
import { LoggerService } from '../../../logger/logger.service';
import { PermissionManagementService } from '../../domain/services/permission-management.service';

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
        if (error instanceof Error) {
            if (error.message === 'User not found') {
                throw new NotFoundException(context, error.message);
            }
            if (error.message.includes('Not authorized') || error.message.includes('Invalid capability')) {
                throw new ForbiddenException(context, error.message);
            }
        }
        throw error;
    }

    protected get context(): ContextString {
        return 'DenyPermissionUseCase/run';
    }
}