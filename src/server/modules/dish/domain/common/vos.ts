// import Hashids from 'hashids';
import { Provider } from '../../../../common/enums';
import { DishId } from '../../../../common/types';

// const hashids = new Hashids(process.env.DISH_ID_SECRET_SALT ?? 'secret-hasher-salt', 8);

export class EncodedDishIdVo {

    constructor(
        private readonly _value: string,
        private readonly _provider: Provider,
        private readonly _dishId: DishId
    ) {}

    // static fromParts(provider: Provider, dishId: string | number): EncodedDishIdVo {
    //     const input = `${provider}:${dishId}`;
    //     const charCodes = Array.from(input).map(char => char.charCodeAt(0));
    //     const encoded = hashids.encode(charCodes);
    //
    //     return new EncodedDishIdVo(encoded, provider, dishId);
    // }
    //
    // static fromEncodedString(encoded: string): EncodedDishIdVo | null {
    //     const charCodes = hashids.decode(encoded) as number[];
    //
    //     if (!charCodes?.length) {
    //         return null;
    //     }
    //
    //     const output = String.fromCharCode(...charCodes);
    //     const [providerName, dishId] = output.split(':');
    //     const provider = Provider[providerName];
    //
    //     if (!Object.values(Provider).includes(providerName as Provider)) {
    //         return null;
    //     }
    //
    //     if (!dishId || dishId.length === 0) {
    //         return null;
    //     }
    //
    //     return new EncodedDishIdVo(encoded, provider, dishId);
    // }

    toString(): string {
        return this._value;
    }

    equals(other: EncodedDishIdVo): boolean {
        return this._value === other._value;
    }

    getValue(): string {
        return this._value;
    }

    getProvider(): Provider {
        return this._provider;
    }

    getDishId(): DishId {
        return this._dishId;
    }

}
