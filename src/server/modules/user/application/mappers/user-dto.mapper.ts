import { UserEntity } from '../../domain/entities';
import { CreatedUserDto, DishOverviewDto, GetUserProfileDto, GetUsersDto, UserDto, UserTokensDto } from '../dtos';
import { UserProfileVo, UserTokensVo } from '../../domain/vos';

export class UserDtoMapper {

    static toGetUsersDto(entities: UserEntity[]): GetUsersDto {
        const userDtos = entities
            .map(entity => {
                const capabilities = entity.getCapabilitiesAsObject();

                return new UserDto(
                    entity.getId(),
                    entity.getEmail(),
                    entity.getLogin(),
                    entity.isAdmin(),
                    capabilities
                );
            });

        return new GetUsersDto(userDtos);
    }

    static toUserTokensDto(userTokensVo: UserTokensVo): UserTokensDto {
        return new UserTokensDto(
            userTokensVo.accessToken,
            userTokensVo.refreshToken
        );
    }

    static toGetUserProfileDto(userProfileVo: UserProfileVo): GetUserProfileDto {
        const dishDtos = userProfileVo.dishList
            .map(dish =>
                DishOverviewDto.fromDishOverviewVo(dish)
            );

        return new GetUserProfileDto(
            userProfileVo.login,
            userProfileVo.activated,
            userProfileVo.isAdmin,
            userProfileVo.capabilities,
            dishDtos
        );
    }

    static toCreatedUserDto(entity: UserEntity): CreatedUserDto {
        return new CreatedUserDto(
            entity.getLogin(),
            entity.getEmail(),
            entity.isActivated()
        );
    }
}