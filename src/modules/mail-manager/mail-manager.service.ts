import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailManagerService {

    constructor(private readonly mailerService: MailerService) {}

    async sendActivationMail(to: string, activationCode: string): Promise<void> {
        await this.sendMail(to, 'Verification', [
            'Thanks for your registration!',
            `To activate your account, use this code: ${activationCode}.`
        ]);
    }

    private async sendMail(to: string, subject: string, contentArr: string[]): Promise<void> {
        try {
            const result = await this.mailerService.sendMail({
                to,
                from: process.env.MAIL_ADDRESS,
                subject,
                text: contentArr.join(';')
            });
            console.log(result);
        } catch (err) {
            console.log(err);
        }
    }
}
