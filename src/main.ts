import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from './pipes/validation.pipe';
import { getCorsOrigins } from './utils';
import { CorsInterceptor } from './interceptors/cors.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: getCorsOrigins(),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    });

    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new CorsInterceptor());

    await app.listen(3001);
}

bootstrap();
