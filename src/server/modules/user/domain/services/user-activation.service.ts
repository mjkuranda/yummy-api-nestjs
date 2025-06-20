import { Injectable } from '@nestjs/common';
import { UserActionRepository, UserRepository } from '../repositories';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { AlreadyActivatedUserError, InactiveUserNotFoundError, UserNotFoundError, UserActionNotFoundError } from '../../../../errors/domain';

@Injectable()
export class UserActivationService {

    private readonly userRepository: UserRepository;
    private readonly userActionRepository: UserActionRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService
    ) {
        this.userRepository = this.providerRegistryService.getUserRepository();
        this.userActionRepository = this.providerRegistryService.getUserActionRepository();
    }

    /**
     * @description activates a new user
     * @param userActionId id od user action
     */
    async activate(userActionId: string): Promise<void> {
        const userAction = await this.userActionRepository.findById(userActionId);

        if (!userAction) {
            throw new UserActionNotFoundError(userActionId);
        }

        const userId = userAction.getUserId();
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new InactiveUserNotFoundError(userId, userActionId);
        }

        if (user.isActivated()) {
            throw new AlreadyActivatedUserError(userId);
        }

        await this.userActionRepository.delete(userActionId);
        await this.userRepository.markAsActivated(userId);
    }

    /**
     * @description activates a new user using user action ID
     * @param id user ID
     */
    async activateViaId(id: string): Promise<void> {
        const userAction = await this.userActionRepository.findByUserId(id);

        if (!userAction) {
            throw new UserActionNotFoundError(id);
        }

        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new UserNotFoundError(id);
        }

        if (user.isActivated()) {
            throw new AlreadyActivatedUserError(id);
        }

        const userActionId = userAction.getId();

        await this.userActionRepository.delete(id);
        await this.userRepository.markAsActivated(userActionId);
    }
}