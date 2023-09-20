import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailManagerService } from './mail-manager.service';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';

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
                }
            })
        } as MailerAsyncOptions)
    ],
    providers: [
        MailManagerService
    ],
    exports: [
        MailManagerService
    ]
})
export class MailManagerModule {}
