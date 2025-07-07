import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DishCommandFacade } from '../../application/dish-command.facade';
import { ContextString } from '../../../../common/types';
import { LoggerService } from '../../../logger/logger.service';

@Injectable()
export class AddUserQueryInterceptor implements NestInterceptor {

    constructor(
       private readonly dishCommandFacade: DishCommandFacade,
       private readonly loggerService: LoggerService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();

        const contextString: ContextString = 'AddUserQueryInterceptor/intercept';

        return next.handle().pipe(
            tap(() => {
                const user = req.user;

                if (!user) {
                    return;
                }

                const ingredients = req.query.ings.split(',');

                this.dishCommandFacade
                    .addDishProposal(user, ingredients)
                    .then(() => this.loggerService.info(contextString, `Successfully added new user search query for "${user.login}" using "${ingredients.join(', ')}" ingredients.`))
                    .catch(error => this.loggerService.error(contextString, error.message));
            }),
        );
    }
}
