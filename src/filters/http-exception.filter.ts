import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { AbstractException } from '../exceptions/abstract.exception';

@Catch(AbstractException)
export class HttpExceptionFilter implements ExceptionFilter {

    catch(exception: AbstractException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();
        const status = exception.getStatus();

        res.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: req.url,
            message: exception.getResponse(),
            context: exception.getContext()
        });
    }
}