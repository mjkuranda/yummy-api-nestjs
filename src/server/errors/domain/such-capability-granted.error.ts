export class SuchCapabilityGrantedError extends Error {

    constructor(userLogin: string) {
        super(`User "${userLogin}" has provided capability.`);
    }
}