import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../exceptions';
import { UserRepository } from '../repositories';
import { ProviderRegistryService } from '../../../provider/provider-registry.service';
import { UserProfileValueObject } from '../value-objects';
import { DishRepository } from '../../../dish/domain/dish.repository';

@Injectable()
export class ProfileManagementService {

    private readonly userRepository: UserRepository;
    private readonly dishRepository: DishRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService
    ) {
        this.userRepository = this.providerRegistryService.getUserRepository();
        this.dishRepository = this.providerRegistryService.getDishRepository();
    }

    /**
     * @description returns general user information and its dishes
     * @param login user login
     * @returns general user info and dish list
     */
    async getProfile(login: string): Promise<UserProfileValueObject> {
        const user = await this.userRepository.findByLogin(login);

        if (!user) {
            throw new NotFoundException('ProfileManagementService/getProfile', `User with "${login}" login has not been found.`);
        }

        // TODO: Should be included as a seperate endpoint from users!
        const dishes = await this.dishRepository.findByAuthor(login);

        return UserProfileValueObject.fromEntity(user, dishes);
    }
}