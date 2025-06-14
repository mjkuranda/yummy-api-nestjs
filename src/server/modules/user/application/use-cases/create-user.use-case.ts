import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { BadRequestException } from '../../../../exceptions';
import { CreatedUserDto, CreateUserDto } from '../dtos';
import { UserManagementService } from '../../domain/services/user-management.service';
import { LoggerService } from '../../../logger/logger.service';
import { UserDtoMapper } from '../mappers';
import { UserAlreadyExistsError } from '../../../../errors/domain';
import { InvalidMongooseObjectIdError } from '../../../../errors/infrastructure';

export class CreateUserUseCase extends AbstractUseCase<[CreateUserDto], CreatedUserDto> {
    constructor(
        private readonly loggerService: LoggerService,
        private readonly userManagementService: UserManagementService
    ) {
        super();
    }

    protected async run(createUserDto: CreateUserDto): Promise<CreatedUserDto> {
        const { login, email, password } = createUserDto;
        const user = await this.userManagementService.createUser(login, email, password);

        const message = `Created user "${user.getLogin()}" with id "${user.getId()}". Activation link has been sent to "${user.getEmail()}".`;
        this.loggerService.info(this.context, message);

        return UserDtoMapper.toCreatedUserDto(user);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof InvalidMongooseObjectIdError) {
            throw new BadRequestException(context, error.message);
        }

        if (error instanceof UserAlreadyExistsError) {
            throw new BadRequestException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'CreateUserUseCase/run';
    }
}