import { UserEntity } from '../entities';

export type CapabilityType = string;

export class UserCapabilitiesVo {
    constructor(
        public readonly capabilities: Map<CapabilityType, boolean> = new Map(),
        public readonly isAdmin?: boolean
    ) {}

    grant(capability: CapabilityType): UserCapabilitiesVo {
        const newCapabilities = new Map(this.capabilities);
        newCapabilities.set(capability, true);

        return new UserCapabilitiesVo(newCapabilities);
    }

    deny(capability: CapabilityType): UserCapabilitiesVo {
        const newCapabilities = new Map(this.capabilities);
        newCapabilities.set(capability, false);

        return new UserCapabilitiesVo(newCapabilities);
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

    static fromObject(obj: Record<CapabilityType, boolean>, isAdmin?: boolean): UserCapabilitiesVo {
        const capabilities = new Map<CapabilityType, boolean>();
        Object.entries(obj).forEach(([key, value]) => {
            capabilities.set(key, value);
        });

        return new UserCapabilitiesVo(
            capabilities,
            isAdmin ?? false
        );
    }

    static fromEntity(entity: UserEntity): UserCapabilitiesVo {
        return new UserCapabilitiesVo(
            entity.getCapabilities().capabilities,
            entity.isAdmin()
        );
    }

    copy(): UserCapabilitiesVo {
        return new UserCapabilitiesVo(new Map(this.capabilities), this.isAdmin);
    }
}