import { UserEntity } from '../entities';

export type CapabilityType = string;

export class UserCapabilitiesValueObject {
    constructor(
        public readonly capabilities: Map<CapabilityType, boolean> = new Map(),
        public readonly isAdmin?: boolean
    ) {}

    grant(capability: CapabilityType): UserCapabilitiesValueObject {
        const newCapabilities = new Map(this.capabilities);
        newCapabilities.set(capability, true);

        return new UserCapabilitiesValueObject(newCapabilities);
    }

    deny(capability: CapabilityType): UserCapabilitiesValueObject {
        const newCapabilities = new Map(this.capabilities);
        newCapabilities.set(capability, false);

        return new UserCapabilitiesValueObject(newCapabilities);
    }

    has(capability: CapabilityType): boolean {
        return this.capabilities.get(capability) || false;
    }

    toObject(): Record<CapabilityType, boolean> {
        const result: Record<CapabilityType, boolean> = {};
        this.capabilities.forEach((value, key) => {
            result[key] = value;
        });

        return result;
    }

    static fromObject(obj: Record<CapabilityType, boolean>, isAdmin?: boolean): UserCapabilitiesValueObject {
        const capabilities = new Map<CapabilityType, boolean>();
        Object.entries(obj).forEach(([key, value]) => {
            capabilities.set(key, value);
        });

        return new UserCapabilitiesValueObject(
            capabilities,
            isAdmin ?? false
        );
    }

    static fromEntity(entity: UserEntity): UserCapabilitiesValueObject {
        return new UserCapabilitiesValueObject(
            entity.getCapabilities().capabilities,
            entity.isAdmin()
        );
    }

    copy(): UserCapabilitiesValueObject {
        return new UserCapabilitiesValueObject(new Map(this.capabilities), this.isAdmin);
    }
}