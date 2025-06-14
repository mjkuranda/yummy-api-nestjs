import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString } from '../../../../common/types';
import { Response } from 'express';
import { BadRequestException } from '../../../../exceptions';
import { LoggerService } from '../../../logger/logger.service';
import { AuthenticationService } from '../../domain/services/authentication.service';
import { MismatchedUserTokensError, UserWithLoginNotFoundError } from '../../../../errors/domain';
import { InvalidMongooseObjectIdError } from '../../../../errors/infrastructure';
import { UserTokensDto } from '../dtos';
import { UserDtoMapper } from '../mappers';
import { UserAccessTokenPayload } from '../../../jwt-manager/jwt-manager.types';

export class RefreshTokensUseCase extends AbstractUseCase<[UserAccessTokenPayload, string, Response], UserTokensDto> {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly authenticationService: AuthenticationService
    ) {
        super();
    }

    protected async run(userPayload: UserAccessTokenPayload, accessToken: string, res: Response): Promise<UserTokensDto> {
        const userTokensVo = await this.authenticationService.refreshTokens(userPayload, accessToken);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = userTokensVo;

        res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: 'none', secure: true });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'none', secure: true });

        this.loggerService.info(this.context, `Tokens refreshed successfully for user "${userPayload.login}"`);

        return UserDtoMapper.toUserTokensDto(userTokensVo);
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof InvalidMongooseObjectIdError) {
            throw new BadRequestException(context, error.message);
        }

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