import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Hashids from 'hashids/cjs';

@Injectable()
export class TokenService {

    private readonly AES_KEY = crypto
        .createHash('sha256')
        .update(process.env.AES_KEY_SECRET)
        .digest();

    private readonly IV_LENGTH = 8;
    private readonly TAG_LENGTH = 8;

    private readonly hashids = new Hashids(
        process.env.HASHIDS_SALT,
        10,
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
    );

    encode(provider: string, id: string | number): string {
        const providerCode = [...provider].reduce((sum, c) => sum + c.charCodeAt(0), 0);
        const hash = this.hashids.encode(providerCode, Number(id)).padEnd(10, '_');

        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.AES_KEY, iv, {
            authTagLength: this.TAG_LENGTH,
        });

        const encrypted = Buffer.concat([cipher.update(hash, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        const full = Buffer.concat([iv, tag, encrypted]);

        return full.toString('base64url');
    }

    decode(token: string): { providerCode: number; id: number } {
        const raw = Buffer.from(token, 'base64url');

        const iv = raw.subarray(0, this.IV_LENGTH);
        const tag = raw.subarray(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
        const encrypted = raw.subarray(this.IV_LENGTH + this.TAG_LENGTH);

        const decipher = crypto.createDecipheriv('aes-256-gcm', this.AES_KEY, iv, {
            authTagLength: this.TAG_LENGTH,
        });

        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        const hash = decrypted.toString('utf8').replace(/_+$/, '');
        const [providerCodeRaw, idRaw] = this.hashids.decode(hash);

        const providerCode = Number(providerCodeRaw);
        const id = Number(idRaw);

        if (!Number.isInteger(providerCode) || !Number.isInteger(id)) {
            throw new Error('Invalid token payload');
        }

        return { providerCode, id };
    }

}
