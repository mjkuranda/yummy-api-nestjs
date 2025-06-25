import { CacheInterface } from './cache.interface';

export type CachePipeline = Omit<CacheInterface, 'has'> & {
    execute(): Promise<unknown[]>;
};