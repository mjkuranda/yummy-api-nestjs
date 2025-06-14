import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { BadRequestException, ForbiddenException, NotFoundException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { CapabilityType } from '../../user.types';
import { PermissionManagementService } from '../../domain/services/permission-management.service';
import { NoSuchCapabilityError, SuchCapabilityGrantedError, UserWithLoginNotFoundError } from '../../../../errors/domain';
import { InvalidMongooseObjectIdError } from '../../../../errors/infrastructure';

export class GrantPermissionUseCase extends AbstractUseCase<[string, string, CapabilityType], void> {
    constructor(
        private readonly loggerService: LoggerService,
        private readonly permissionManagementService: PermissionManagementService
    ) {
        super();
    }

    protected async run(grantorLogin: string, granteeLogin: string, capability: CapabilityType): Promise<void> {
        await this.permissionManagementService.grantPermission(grantorLogin, granteeLogin, capability);

        const message = `Permission "${capability}" has been given by user "${grantorLogin}" to user "${granteeLogin}".`;
        this.loggerService.info(this.context, message);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof InvalidMongooseObjectIdError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof UserWithLoginNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof SuchCapabilityGrantedError) {
            throw new BadRequestException(context, error.message);
        }

        if (error instanceof NoSuchCapabilityError) {
            throw new ForbiddenException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'GrantPermissionUseCase/run';
    }
}