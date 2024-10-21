import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailManagerService } from './mail-manager.service';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { LoggerModule } from '../logger/logger.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: () => ({
                transport: {
                    host: process.env.MAIL_HOST,
                    port: Number(process.env.MAIL_PORT),
                    auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASS
                    },
                },
                template: {
                    dir: join(process.cwd(), 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                }
            })
        } as MailerAsyncOptions),
        LoggerModule
    ],
    providers: [
        MailManagerService
    ],
    exports: [
        MailManagerService
    ]
})
export class MailManagerModule {}
