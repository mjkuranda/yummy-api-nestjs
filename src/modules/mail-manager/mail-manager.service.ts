import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MailManagerService {

    constructor(
        private readonly mailerService: MailerService,
        private readonly loggerService: LoggerService
    ) {}

    async sendActivationMail(to: string, username: string, activationCode: string): Promise<void> {
        await this.sendMail(to, 'Witamy na naszej platformie!', username, activationCode);
    }

    private async sendMail(to: string, subject: string, username: string, activationCode: string): Promise<void> {
        const context = 'MailManagerService/sendMail';

        try {
            const { accepted, messageTime } = await this.mailerService.sendMail({
                to,
                from: process.env.MAIL_ADDRESS,
                subject,
                context: {
                    username,
                    link: `${process.env.FRONTEND_WEB}/users/${activationCode}/activate`
                },
                template: 'activation'
            });

            this.loggerService.info(context, `Send activation mail to "${accepted[0]}". It took ${(messageTime / 1000).toFixed(1)}s`);
        } catch (err) {
            this.loggerService.error(context, err);
        }
    }
}
