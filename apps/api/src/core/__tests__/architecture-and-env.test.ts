import { describe, it, expect } from 'vitest';
import { resolveEnvSecret, Env } from '../config/env.js';
import { hashFarmerPhonePii } from '../crypto/hash.js';

describe('Core Infrastructure: Secret Resolution & PII Protection', () => {
  it('prioritizes Cloudflare Worker bindings over process.env without hardcoding secrets', () => {
    const mockBindings: Env = {
      INTERNAL_API_SECRET: 'worker_binding_secret_token',
    };
    expect(resolveEnvSecret(mockBindings, 'INTERNAL_API_SECRET')).toBe('worker_binding_secret_token');
    expect(resolveEnvSecret(undefined, 'ZALO_OA_SECRET_KEY')).toBeUndefined();
  });

  it('enforces mandatory cryptographic salt length for Decree 13/2023/ND-CP phone hashing', async () => {
    const validSalt = 'agridata_32_char_secret_salt_for_pii_protection';
    const hashA = await hashFarmerPhonePii('+84 912 345 678', validSalt);
    const hashB = await hashFarmerPhonePii('84912345678', validSalt);
    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);

    await expect(hashFarmerPhonePii('0912345678', '')).rejects.toThrow('PII_HASH_SALT');
  });
});

