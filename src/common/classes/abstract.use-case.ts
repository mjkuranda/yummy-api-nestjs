import { Executable } from '../interfaces';

export abstract class AbstractUseCase<TParams extends unknown[], TOutput> implements Executable<TParams, TOutput> {

    abstract execute(...params: TParams): Promise<TOutput>;
}