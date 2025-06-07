import Hashids from 'hashids';
import { Provider } from '../enums';
import { EncodedDishId } from '../types';

const hashids = new Hashids('your-secret-salt', 8);

export class DishIdObfuscator {

    /**
     * @description Returns encoded dish ID
     * @param providerName dish source name
     * @param dishId dish identification number
     */
    static encode(providerName: Provider, dishId: string | number): EncodedDishId {
        const input = `${providerName}:${dishId}`;
        const charCodes = Array.from(input).map(char => char.charCodeAt(0));

        return hashids.encode(charCodes);
    }

    /**
     * @description Returns a decoded pair: provider name and dish ID
     * @param encodedDishId encoded dish ID and its provider name
     */
    static decode(encodedDishId: EncodedDishId): { providerName: Provider, dishId: string } | null {
        const charCodes = hashids.decode(encodedDishId) as number[];

        if (!charCodes?.length) {
            return null;
        }

        const output = String.fromCharCode(...charCodes);

        if (!output.includes(':')) {
            return null;
        }

        // Could be potentially more than 2 elements, but we check only the first two
        const [providerName, dishId] = output.split(':');

        if (!Object.values(Provider).includes(providerName as Provider)) {
            return null;
        }

        return {
            providerName: providerName as Provider,
            dishId
        };
    }
}