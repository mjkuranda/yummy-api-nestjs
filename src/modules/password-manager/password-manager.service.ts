import { Injectable } from '@nestjs/common';
import { PasswordStructType } from './password-manager.types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordManagerService {

    async generateSalt(): Promise<string> {
        return await bcrypt.hash(Date.now().toString(), 12);
    }

    async getHashedPassword(passwordStruct: PasswordStructType): Promise<string> {
        const { password, salt, pepper } = passwordStruct;

        return await bcrypt.hash(password + salt + pepper, 12);
    }

    async areEqualPasswords(passwordStruct: PasswordStructType, hashedPassword: string): Promise<boolean> {
        const { password, salt, pepper } = passwordStruct;

        return await bcrypt.compare(password + salt + pepper, hashedPassword);
    }
}