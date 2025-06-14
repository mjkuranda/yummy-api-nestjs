import { UserCapabilitiesValueObject } from '../value-objects';
import { CapabilityType } from '../../user.types';

export class UserEntity {
    constructor(
        private readonly _id: string | null,
        private readonly _login: string,
        private readonly _email: string,
        private readonly _password: string,
        private readonly _salt: string,
        private readonly _activated: number = -1,
        private readonly _isAdmin: boolean = false,
        private readonly _capabilities: UserCapabilitiesValueObject = new UserCapabilitiesValueObject()
    ) {}

    getId(): string | null {
        return this._id;
    }

    getLogin(): string {
        return this._login;
    }

    getEmail(): string {
        return this._email;
    }

    getPassword(): string {
        return this._password;
    }

    getSalt(): string {
        return this._salt;
    }

    isActivated(): boolean {
        return this._activated > 0 && this._activated <= Date.now();
    }

    getActivationTime(): number {
        return this._activated;
    }

    isAdmin(): boolean {
        return this._isAdmin;
    }

    hasCapability(capability: CapabilityType): boolean {
        return this._capabilities.capabilities.has(capability);
    }

    getCapabilities(): UserCapabilitiesValueObject {
        return this._capabilities;
    }

    getCapabilitiesAsObject(): Record<CapabilityType, boolean> {
        const entries = Object.fromEntries(this._capabilities.capabilities);

        return entries as Record<CapabilityType, boolean>;
    }

    activate(): UserEntity {
        return new UserEntity(
            this._id,
            this._login,
            this._email,
            this._password,
            this._salt,
            Date.now(),
            this._isAdmin,
            this._capabilities
        );
    }

    changePassword(password: string, salt: string): UserEntity {
        return new UserEntity(
            this._id,
            this._login,
            this._email,
            password,
            salt,
            this._activated,
            this._isAdmin,
            this._capabilities
        );
    }

    grantCapability(capability: string): UserEntity {
        const newCapabilities = this._capabilities.grant(capability);

        return new UserEntity(
            this._id,
            this._login,
            this._email,
            this._password,
            this._salt,
            this._activated,
            this._isAdmin,
            newCapabilities
        );
    }

    denyCapability(capability: string): UserEntity {
        const newCapabilities = this._capabilities.deny(capability);

        return new UserEntity(
            this._id,
            this._login,
            this._email,
            this._password,
            this._salt,
            this._activated,
            this._isAdmin,
            newCapabilities
        );
    }
}