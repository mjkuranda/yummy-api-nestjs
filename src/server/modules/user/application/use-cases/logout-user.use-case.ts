import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { Response } from 'express';
import { BadRequestException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { AuthenticationService } from '../../domain/services/authentication.service';
import { MismatchedUserTokensError, UserWithLoginNotFoundError } from '../../../../errors/domain';

export class LogoutUserUseCase extends AbstractUseCase<[Response, string, string, string], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly authenticationService: AuthenticationService
    ) {
        super();
    }

    protected async run(res: Response, login: string, accessToken: string, refreshToken: string): Promise<void> {
        await this.authenticationService.logout(login, accessToken, refreshToken);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        this.loggerService.info(this.context, `User "${login}" has been successfully logged out`);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof MismatchedUserTokensError) {
            throw new BadRequestException(context, error.message);
        }

        if (error instanceof UserWithLoginNotFoundError) {
            throw new BadRequestException(context, error.message);
        }

        throw error;
    }

    protected get context(): ContextString {
        return 'LogoutUserUseCase/run';
    }
}