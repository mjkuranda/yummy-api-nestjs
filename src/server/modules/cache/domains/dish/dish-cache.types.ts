import { Provider } from '../../../../common/enums';

export type DishSearchResultKey = `dish:results:ingredients:${string}`;
export type DishSearchResultPerProviderKey = `dish:results:provider:${Provider}`;
export type DishDetailedKey = `dish:detailed:${string}`;