import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { GetUsersDto } from '../dtos';
import { LoggerService } from '../../../logger/logger.service';
import { UserManagementService } from '../../domain/services/user-management.service';
import { UserDtoMapper } from '../mappers';

export class GetNotActivatedUsersUseCase extends AbstractUseCase<[], GetUsersDto> {
    constructor(
        private readonly loggerService: LoggerService,
        private readonly userManagementService: UserManagementService
    ) {
        super();
    }

    protected async run(): Promise<GetUsersDto> {
        const users = await this.userManagementService.getNotActivatedUsers();
        this.loggerService.info(this.context, `Retrieved ${users.length} not activated users`);

        return UserDtoMapper.toGetUsersDto(users);
    }

    protected handleError(error: unknown, context: ContextString): never {
        throw error;
    }

    protected get context(): ContextString {
        return 'GetNotActivatedUsersUseCase/run';
    }
}