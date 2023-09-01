import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter())
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(3000);
}

bootstrap();
