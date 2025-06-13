import { Executable } from '../interfaces';
import { ContextString } from '../types';

export abstract class AbstractUseCase<TParams extends unknown[] = [], TOutput = void> implements Executable<TParams, TOutput> {

    public async execute(...params: TParams): Promise<TOutput> {
        try {
            return await this.run(...params);
        } catch (err: unknown) {
            this.handleError(err, this.context);
        }
    }

    protected abstract run(...params: TParams): Promise<TOutput>;

    protected handleError(err: unknown, context: ContextString): never {
        if (err instanceof Error) {
            throw new Error(`[${context}] ${err.message}`);
        }
        throw new Error(`[${context}] An unexpected error occurred`);
    }

    protected get context(): ContextString {
        return `UseCase/${this.constructor.name}` as ContextString;
    }
}