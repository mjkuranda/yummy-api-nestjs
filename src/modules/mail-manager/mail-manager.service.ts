import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MailManagerService {

    constructor(
        private readonly mailerService: MailerService,
        private readonly loggerService: LoggerService
    ) {}

    async sendActivationMail(to: string, activationCode: string): Promise<void> {
        await this.sendMail(to, 'Verification', [
            'Thanks for your registration!',
            `To activate your account, use this code: ${activationCode}.`
        ]);
    }

    private async sendMail(to: string, subject: string, contentArr: string[]): Promise<void> {
        const context = 'MailManagerService/sendMail';

        try {
            const result = await this.mailerService.sendMail({
                to,
                from: process.env.MAIL_ADDRESS,
                subject,
                text: contentArr.join(';')
            });

            this.loggerService.info(context, result);
        } catch (err) {
            this.loggerService.error(context, err);
        }
    }
}
