import { Test } from '@nestjs/testing';
import { TokenService } from '../dish-id.service';

describe('TokenService', () => {
    let service: TokenService;

    beforeAll(async () => {
        // Set up environment variables for testing
        process.env.AES_KEY_SECRET = 'test-aes-key-secret-for-testing-purposes';
        process.env.HASHIDS_SALT = 'test-hashids-salt';

        const module = await Test.createTestingModule({
            providers: [TokenService],
        }).compile();

        service = module.get(TokenService);
    });

    afterAll(() => {
        // Clean up environment variables
        delete process.env.AES_KEY_SECRET;
        delete process.env.HASHIDS_SALT;
    });

    describe('encode', () => {
        it('should encode provider and id into a token', () => {
            const provider = 'test-provider';
            const id = 123;

            const token = service.encode(provider, id);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });

        it('should encode different providers and ids', () => {
            const provider1 = 'provider1';
            const provider2 = 'provider2';
            const id1 = 123;
            const id2 = 456;

            const token1 = service.encode(provider1, id1);
            const token2 = service.encode(provider2, id2);

            expect(token1).not.toBe(token2);
        });

        it('should handle string ids', () => {
            const provider = 'test-provider';
            const id = '123';

            const token = service.encode(provider, id);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should handle numeric ids', () => {
            const provider = 'test-provider';
            const id = 123;

            const token = service.encode(provider, id);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });
    });

    describe('decode', () => {
        it('should decode a valid token back to provider code and id', () => {
            const provider = 'test-provider';
            const id = 123;

            const token = service.encode(provider, id);
            const decoded = service.decode(token);

            expect(decoded).toBeDefined();
            expect(decoded.providerCode).toBeDefined();
            expect(decoded.id).toBeDefined();
            expect(typeof decoded.providerCode).toBe('number');
            expect(typeof decoded.id).toBe('number');
            expect(Number.isInteger(decoded.providerCode)).toBe(true);
            expect(Number.isInteger(decoded.id)).toBe(true);
        });

        it('should decode to the correct id', () => {
            const provider = 'test-provider';
            const id = 123;

            const token = service.encode(provider, id);
            const decoded = service.decode(token);

            expect(decoded.id).toBe(id);
        });

        it('should handle different providers and ids', () => {
            const provider1 = 'provider1';
            const provider2 = 'provider2';
            const id1 = 123;
            const id2 = 456;

            const token1 = service.encode(provider1, id1);
            const token2 = service.encode(provider2, id2);

            const decoded1 = service.decode(token1);
            const decoded2 = service.decode(token2);

            expect(decoded1.id).toBe(id1);
            expect(decoded2.id).toBe(id2);
            expect(decoded1.providerCode).not.toBe(decoded2.providerCode);
        });

        it('should throw error for invalid token', () => {
            const invalidToken = 'invalid-token';

            expect(() => service.decode(invalidToken)).toThrow();
        });

        it('should throw error for malformed token', () => {
            const malformedToken = 'a'.repeat(50);

            expect(() => service.decode(malformedToken)).toThrow();
        });
    });

    describe('encode and decode roundtrip', () => {
        it('should encode and decode back to original values', () => {
            const provider = 'test-provider';
            const id = 123;

            const token = service.encode(provider, id);
            const decoded = service.decode(token);

            expect(decoded.id).toBe(id);
        });

        it('should work with different provider names', () => {
            const providers = ['provider1', 'provider2', 'external-api', 'internal-api'];
            const id = 123;

            providers.forEach(provider => {
                const token = service.encode(provider, id);
                const decoded = service.decode(token);

                expect(decoded.id).toBe(id);
            });
        });

        it('should work with different ids', () => {
            const provider = 'test-provider';
            const ids = [1, 123, 999999, 0];

            ids.forEach(id => {
                const token = service.encode(provider, id);
                const decoded = service.decode(token);

                expect(decoded.id).toBe(id);
            });
        });
    });
});