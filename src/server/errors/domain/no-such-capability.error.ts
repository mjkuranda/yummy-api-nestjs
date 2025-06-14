import { CapabilityType } from '../../modules/user/user.types';

export class NoSuchCapabilityError extends Error {

    constructor(userLogin: string, capability: CapabilityType) {
        super(`User "${userLogin}" has not requested capability "${capability}" to deny.`);
    }
}