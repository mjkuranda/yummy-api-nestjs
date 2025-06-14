import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { Response } from 'express';
import { BadRequestException, NotFoundException, ForbiddenException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { AuthenticationService } from '../../domain/services/authentication.service';
import { UserLoginDto, UserTokensDto } from '../dtos';
import { UserDtoMapper } from '../mappers';

export class LoginUserUseCase extends AbstractUseCase<[UserLoginDto, Response], UserTokensDto> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly authenticationService: AuthenticationService
    ) {
        super();
    }

    protected async run(userLoginDto: UserLoginDto, res: Response): Promise<UserTokensDto> {
        const { login, password } = userLoginDto;
        const userTokensVo = await this.authenticationService.login(login, password);
        const { accessToken, refreshToken } = userTokensVo;

        res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'none', secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'none', secure: true });

        const message = `User "${login}" has been successfully logged in.`;

        this.loggerService.info(this.context, message);

        return UserDtoMapper.toUserTokensDto(userTokensVo);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof Error) {
            if (error.message.includes('does not exist')) {
                throw new NotFoundException(context, error.message);
            }
            if (error.message.includes('not a valid account')) {
                throw new ForbiddenException(context, error.message);
            }
            if (error.message.includes('Incorrect credentials')) {
                throw new BadRequestException(context, error.message);
            }
        }
        throw error;
    }

    protected get context(): ContextString {
        return 'AuthenticateUserUseCase/run';
    }
}