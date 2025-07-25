import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Hashids from 'hashids/cjs';
import { DishId } from '../../../../common/types';
import { EncodedDishIdVo } from './vos';
import { Provider } from '../../../../common/enums';
import { InvalidDishIdTokenError } from '../errors';

@Injectable()
export class DishTokenService {

    private readonly AES_KEY = crypto
        .createHash('sha256')
        .update(process.env.AES_KEY_SECRET)
        .digest();

    private readonly IV_LENGTH = 8;
    private readonly TAG_LENGTH = 8;

    private readonly hashids = new Hashids(
        process.env.DISH_ID_SECRET_SALT,
        10,
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
    );

    encode(provider: Provider, id: DishId): string {
        const providerValue = this.stringToBigInt(provider);
        const hash = this.hashids.encode(providerValue, Number(id)).padEnd(10, '_');

        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.AES_KEY, iv, {
            authTagLength: this.TAG_LENGTH,
        });

        const encrypted = Buffer.concat([cipher.update(hash, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        const full = Buffer.concat([iv, tag, encrypted]);

        // NOTE: Only 32 chars
        return full.toString('base64url');
    }

    decode(token: string): EncodedDishIdVo {
        const raw = Buffer.from(token, 'base64url');
        const iv = raw.slice(0, this.IV_LENGTH);
        const tag = raw.slice(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
        const encrypted = raw.slice(this.IV_LENGTH + this.TAG_LENGTH);

        const decipher = crypto.createDecipheriv('aes-256-gcm', this.AES_KEY, iv, {
            authTagLength: this.TAG_LENGTH,
        });

        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        const hash = decrypted.toString('utf8').replace(/_+$/, '');
        const decoded = this.hashids.decode(hash);

        if (decoded.length !== 2 || !decoded.every((n) => typeof n === 'number')) {
            throw new InvalidDishIdTokenError();
        }

        const [providerValue, id] = decoded as [bigint, DishId];
        const provider = this.bigIntToString(providerValue) as Provider; // TODO: Check this value

        return new EncodedDishIdVo(token, provider, id);
    }

    private stringToBigInt(str: string): bigint {
        const hex = Buffer.from(str, 'utf8').toString('hex');

        return BigInt('0x' + hex);
    }

    private bigIntToString(num: bigint): string {
        let hex = num.toString(16);
        if (hex.length % 2 !== 0) hex = '0' + hex; // NOTE: add zero at the beginning, if length is odd

        return Buffer.from(hex, 'hex').toString('utf8');
    }
}
