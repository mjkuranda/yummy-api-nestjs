import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
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
        const origin = req.headers.origin ?? '*'; // NOTE: '*' is dangerous but below is a flag defining the healthcheck
        const isHealthcheck = req.path === '/healthcheck';

        if (!isHealthcheck && !allowedOrigins.includes(origin)) {
            throw new HttpException('CORS policy does not allow this origin', HttpStatus.FORBIDDEN);
        }

        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        return next.handle().pipe(
            tap(() => {
                // NOTE: Place for extra logics
            }),
        );
    }
}
