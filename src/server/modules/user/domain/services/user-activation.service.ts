import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { AlreadyActivatedUserError, InactiveUserNotFoundError, UserNotFoundError, UserActionNotFoundError } from '../../../../errors/domain';
import { UserDataManageable } from '../../../provider-registry/data-manageable.interface';

@Injectable()
export class UserActivationService {

    private readonly userApiService: UserDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService
    ) {
        this.userApiService = this.providerRegistryService.getUserApiService();
    }

    /**
     * @description activates a new user
     * @param userActionId id od user action
     */
    async activate(userActionId: string): Promise<void> {
        const userAction = await this.userApiService.findActionById(userActionId);

        if (!userAction) {
            throw new UserActionNotFoundError(userActionId);
        }

        const userId = userAction.getUserId();
        const user = await this.userApiService.findUserById(userId);

        if (!user) {
            throw new InactiveUserNotFoundError(userId, userActionId);
        }

        if (user.isActivated()) {
            throw new AlreadyActivatedUserError(userId);
        }

        await this.userApiService.deleteAction(userActionId);
        await this.userApiService.markAsActivatedUser(userId);
    }

    /**
     * @description activates a new user using user action ID
     * @param id user ID
     */
    async activateViaId(id: string): Promise<void> {
        const userAction = await this.userApiService.findActionByUserId(id);

        if (!userAction) {
            throw new UserActionNotFoundError(id);
        }

        const user = await this.userApiService.findUserById(id);

        if (!user) {
            throw new UserNotFoundError(id);
        }

        if (user.isActivated()) {
            throw new AlreadyActivatedUserError(id);
        }

        const userActionId = userAction.getId();

        await this.userApiService.deleteAction(id);
        await this.userApiService.markAsActivatedUser(userActionId);
    }
}