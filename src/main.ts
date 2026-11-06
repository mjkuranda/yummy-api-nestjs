import { SecureAppFactory, SecurityModuleOptions } from '@mkuranda/nestjs-security-sdk';
import { AppModule } from './app.module';
import { getCorsOrigins } from './utils';
import { ACCESS_TOKEN_DURATION, REFRESH_TOKEN_DURATION } from './constants/tokens.constant';
import { loggerConsoleFactory } from './modules/logger/logger.factory';
import { createLogger } from 'winston';
import { LoggerService } from './modules/logger/logger.service';

async function bootstrap() {
    const winstonInstance = createLogger({
        transports: [
            loggerConsoleFactory(),
        ],
    });

    const options: SecurityModuleOptions = {
        cors: {
            origins: getCorsOrigins(),
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            credentials: true,
            headers: ['Content-Type', 'Authorization'],
        },
        jwt: {
            accessToken: {
                expiresIn: ACCESS_TOKEN_DURATION,
                secret: process.env.ACCESS_TOKEN_SECRET,
            },
            refreshToken: {
                expiresIn: REFRESH_TOKEN_DURATION,
                secret: process.env.REFRESH_TOKEN_SECRET,
            },
            issuer: 'dish-matcher-api'
        },
        maxmindLicenceKey: process.env.MAXMIND_LICENCE_KEY,
        monitoring: {
            redisHost: 'localhost',
            redisPort: 6379,
            monitoringApiPort: 4001,
        },
        payloadLimit: '10kb',
        logger: new LoggerService(winstonInstance),
        rbac: {
            roles: ['admin', 'user'],
            permissions: ['can-add', 'can-edit', 'can-delete'],
        },
        sanitizer: {
            maxDepth: 3,
            blockedPrefixes: ['$', '$$'],
        },
        secureTraffic: {
            limit: 120,
            ttl: 60,
        },
    };
    const app = await SecureAppFactory.create(AppModule, options);
    await app.listen(4000);
}

bootstrap();
