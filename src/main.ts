import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from './pipes/validation.pipe';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(3001);
}

bootstrap();
