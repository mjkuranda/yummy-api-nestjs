import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { CapabilityType } from '../../user.types';
import { NoSuchCapabilityError, SuchCapabilityGrantedError, UserWithLoginNotFoundError } from '../../../../errors/domain';
import { UserDataManageable } from '../../../provider-registry/data-manageable.interface';

@Injectable()
export class PermissionManagementService {

    private readonly userApiService: UserDataManageable;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService
    ) {
        this.userApiService = this.providerRegistryService.getUserApiService();
    }

    /**
     * @description takes a permission from the user
     * @param grantorLogin user login who gives
     * @param granteeLogin user login whom capability is given
     * @param capability capability to give
     */
    async grantPermission(grantorLogin: string, granteeLogin: string, capability: CapabilityType): Promise<void> {
        const grantorEntity = await this.userApiService.findUserByLogin(grantorLogin);
        const granteeEntity = await this.userApiService.findUserByLogin(granteeLogin);

        if (!grantorEntity) {
            throw new UserWithLoginNotFoundError(grantorLogin);
        }

        if (!granteeEntity) {
            throw new UserWithLoginNotFoundError(granteeLogin);
        }

        if (granteeEntity.hasCapability(capability)) {
            throw new SuchCapabilityGrantedError(granteeLogin);
        }

        await this.userApiService.grantPermissionForUser(granteeEntity, capability);
    }

    /**
     * @description takes a permission from the user
     * @param denierLogin user login who takes
     * @param targetLogin user login whom capability is taken
     * @param capability capability to take
     */
    async denyPermission(denierLogin: string, targetLogin: string, capability: CapabilityType): Promise<void> {
        const denierUser = await this.userApiService.findUserByLogin(denierLogin);
        const targetUser = await this.userApiService.findUserByLogin(targetLogin);

        if (!denierUser) {
            throw new UserWithLoginNotFoundError(denierLogin);
        }

        if (!!targetUser) {
            throw new UserWithLoginNotFoundError(targetLogin);
        }

        if (!targetUser.hasCapability(capability)) {
            throw new NoSuchCapabilityError(targetLogin, capability);
        }

        await this.userApiService.denyPermissionForUser(targetUser, capability);
    }
}