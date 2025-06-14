import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { NotFoundException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { ProfileManagementService } from '../../domain/services/profile-management.service';
import { GetUserProfileDto } from '../dtos';
import { UserDtoMapper } from '../mappers';

export class GetUserProfileUseCase extends AbstractUseCase<[string], GetUserProfileDto> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly profileManagementService: ProfileManagementService
    ) {
        super();
    }

    protected async run(login: string): Promise<GetUserProfileDto> {
        const profile = await this.profileManagementService.getProfile(login);

        this.loggerService.info(this.context, `Retrieved profile for user "${login}"`);

        return UserDtoMapper.toGetUserProfileDto(profile);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof Error && error.message.includes('not found')) {
            throw new NotFoundException(context, error.message);
        }
        throw error;
    }

    protected get context(): ContextString {
        return 'GetUserProfileUseCase/run';
    }
}