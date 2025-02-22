import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getCorsOrigins } from '../utils';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();

        const allowedOrigins = getCorsOrigins();
        const origin = req.headers.origin;

        if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        return next.handle().pipe(
            tap(() => {
                // NOTE: Place for extra logics
                res.status(403).json({ message: 'CORS policy does not allow this origin' });
            }),
        );
    }
}
