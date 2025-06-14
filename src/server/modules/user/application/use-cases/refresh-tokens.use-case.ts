import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { Response } from 'express';
import { BadRequestException, ForbiddenException } from '../../../../exceptions';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';
import { LoggerService } from '../../../logger/logger.service';
import { AuthenticationService } from '../../domain/services/authentication.service';
import { MismatchedUserTokensError, UserWithLoginNotFoundError } from '../../../../errors/domain';

export class RefreshTokensUseCase extends AbstractUseCase<[UserAccessTokenPayload, string, Response], void> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly authenticationService: AuthenticationService
    ) {
        super();
    }

    protected async run(userPayload: UserAccessTokenPayload, accessToken: string, res: Response): Promise<void> {
        const userTokensVo = await this.authenticationService.refreshTokens(userPayload, accessToken);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = userTokensVo;

        res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: 'none', secure: true });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'none', secure: true });

        this.loggerService.info(this.context, `Tokens refreshed successfully for user "${userPayload.login}"`);
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
        return 'RefreshTokensUseCase/run';
    }
}