import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailManagerService {

    constructor(private readonly mailerService: MailerService) {}

    async sendVerificationMail(to: string): Promise<void> {
        await this.sendMail(to, 'Verification', ['This is test']);
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
