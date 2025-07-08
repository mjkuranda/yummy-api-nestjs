import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../exceptions';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { UserProfileVo } from '../vos';
import { DishDataManageable, UserDataManageable } from '../../../provider-registry/data-manageable.interface';

@Injectable()
export class ProfileManagementService {

    private readonly userApiService: UserDataManageable;
    private readonly dishApiService: DishDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService
    ) {
        this.userApiService = this.providerRegistryService.getUserApiService();
        this.dishApiService = this.providerRegistryService.getDishApiService();
    }

    /**
     * @description returns general user information and its dishes
     * @param login user login
     * @returns general user info and dish list
     */
    async getProfile(login: string): Promise<UserProfileVo> {
        const user = await this.userApiService.findUserByLogin(login);

        if (!user) {
            throw new NotFoundException('ProfileManagementService/getProfile', `User with "${login}" login has not been found.`);
        }

        // TODO: Should be included as a seperate endpoint from users!
        const dishes = await this.dishApiService.findDishesByAuthor(login);

        return UserProfileVo.fromEntity(user, dishes);
    }
}