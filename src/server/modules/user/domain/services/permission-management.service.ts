import { Injectable } from '@nestjs/common';
import { ProviderRegistryService } from '../../../provider-registry/provider-registry.service';
import { UserRepository } from '../repositories';
import { CapabilityType } from '../../user.types';
import { NoSuchCapabilityError, SuchCapabilityGrantedError, UserWithLoginNotFoundError } from '../../../../errors/domain';

@Injectable()
export class PermissionManagementService {

    private readonly userRepository: UserRepository;

    constructor(
        private readonly providerRegistryService: ProviderRegistryService
    ) {
        this.userRepository = this.providerRegistryService.getUserRepository();
    }

    /**
     * @description takes a permission from the user
     * @param grantorLogin user login who gives
     * @param granteeLogin user login whom capability is given
     * @param capability capability to give
     */
    async grantPermission(grantorLogin: string, granteeLogin: string, capability: CapabilityType): Promise<void> {
        const grantorEntity = await this.userRepository.findByLogin(grantorLogin);
        const granteeEntity = await this.userRepository.findByLogin(granteeLogin);

        if (!grantorEntity) {
            throw new UserWithLoginNotFoundError(grantorLogin);
        }

        if (!granteeEntity) {
            throw new UserWithLoginNotFoundError(granteeLogin);
        }

        if (granteeEntity.hasCapability(capability)) {
            throw new SuchCapabilityGrantedError(granteeLogin);
        }

        await this.userRepository.grantPermission(granteeEntity, capability);
    }

    /**
     * @description takes a permission from the user
     * @param denierLogin user login who takes
     * @param targetLogin user login whom capability is taken
     * @param capability capability to take
     */
    async denyPermission(denierLogin: string, targetLogin: string, capability: CapabilityType): Promise<void> {
        const denierUser = await this.userRepository.findByLogin(denierLogin);
        const targetUser = await this.userRepository.findByLogin(targetLogin);

        if (!denierUser) {
            throw new UserWithLoginNotFoundError(denierLogin);
        }

        if (!!targetUser) {
            throw new UserWithLoginNotFoundError(targetLogin);
        }

        if (!targetUser.hasCapability(capability)) {
            throw new NoSuchCapabilityError(targetLogin, capability);
        }

        await this.userRepository.denyPermission(targetUser, capability);
    }
}