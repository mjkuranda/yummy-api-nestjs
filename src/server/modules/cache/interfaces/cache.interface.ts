import { CachePipeline } from './cache-pipeline.interface';

export interface CacheInterface {
    set(key: string, val: string): Promise<void>;
    get(key: string): Promise<string | null>;
    del(...keys: string[]): Promise<void>;
    has(key: string): Promise<boolean>;
    hset(key: string, field: string, val: string): Promise<void>;
    hget(key: string, field: string): Promise<string | null>;
    expire(key: string, seconds: number): Promise<void>;
    createPipeline(): CachePipeline;
}