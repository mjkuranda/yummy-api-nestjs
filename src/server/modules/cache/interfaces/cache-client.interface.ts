import { CacheInterface } from './cache.interface';

export interface CacheClient extends CacheInterface {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}