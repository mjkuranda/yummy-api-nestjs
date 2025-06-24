import { Provider } from '../../../../common/enums';

export class ProviderNotRegisteredError extends Error {
    constructor(provider: Provider) {
        super(`Dish provider "${provider}" is not registered`);
    }
}