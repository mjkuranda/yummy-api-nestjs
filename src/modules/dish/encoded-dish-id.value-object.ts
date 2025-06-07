import Hashids from 'hashids';
import { Provider } from '../../common/enums';

// TODO: Secret salt!!!!
const hashids = new Hashids('your-secret-salt', 8);

export class EncodedDishId {

    private constructor(
        private readonly _value: string,
        private readonly _provider: Provider,
        private readonly _dishId: string | number
    ) {}

    static fromParts(provider: Provider, dishId: string | number): EncodedDishId {
        const input = `${provider}:${dishId}`;
        const charCodes = Array.from(input).map(char => char.charCodeAt(0));
        const encoded = hashids.encode(charCodes);

        return new EncodedDishId(encoded, provider, dishId);
    }

    static fromEncodedString(encoded: string): EncodedDishId | null {
        const charCodes = hashids.decode(encoded) as number[];

        if (!charCodes?.length) {
            return null;
        }

        const output = String.fromCharCode(...charCodes);
        const [providerName, dishId] = output.split(':');
        const provider = Provider[providerName];

        if (!Object.values(Provider).includes(providerName as Provider)) {
            return null;
        }

        if (!dishId || dishId.length === 0) {
            return null;
        }

        return new EncodedDishId(encoded, provider, dishId);
    }

    toString(): string {
        return this._value;
    }

    equals(other: EncodedDishId): boolean {
        return this._value === other._value;
    }

    getValue(): string {
        return this._value;
    }

    getProvider(): Provider {
        return this._provider;
    }

    getDishId(): string | number {
        return this._dishId;
    }

}
