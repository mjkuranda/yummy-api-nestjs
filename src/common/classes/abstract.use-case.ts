import { Executable } from '../interfaces';
import { ContextString } from '../types';

export abstract class AbstractUseCase<TParams extends unknown[], TOutput> implements Executable<TParams, TOutput> {

    public execute(...params: TParams): Promise<TOutput> {
        try {
            return this.run(...params);
        } catch (err: unknown) {
            this.handleError(err, this.context);
        }
    }

    protected abstract run(...params: TParams): Promise<TOutput>;

    protected abstract handleError(err: unknown, context: ContextString): never;

    protected abstract get context(): ContextString;
}