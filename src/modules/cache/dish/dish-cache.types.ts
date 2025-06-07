import { Provider } from '../../../common/enums';
import { EncodedDishId } from '../../../common/types';

export type DishSearchResultKey = `dish:results:ingredients:${string}`;
export type DishSearchResultPerProviderKey = `dish:results:provider:${Provider}`;
export type DishDetailedKey = `dish:detailed:${EncodedDishId}`;