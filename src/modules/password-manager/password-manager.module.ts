import { Module } from '@nestjs/common';
import { PasswordManagerService } from './password-manager.service';

@Module({
    providers: [PasswordManagerService],
    exports: [PasswordManagerService]
})
export class PasswordManagerModule {}
