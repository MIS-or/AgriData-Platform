import { describe, it, expect } from 'vitest';
import { resolveEnvSecret, Env } from '../config/env.js';
import { hashFarmerPhonePii } from '../crypto/hash.js';
import {
  auditCloudflareFreeTierSuite,
  edgeKvGet,
  edgeKvPut,
  edgeR2GetObject,
  edgeR2PutImmutableObject,
  resolveWarehouseConnectionString,
  verifyTurnstileToken,
} from '../cloudflare/edge-services.js';

describe('Core Infrastructure: Secret Resolution, PII Protection & Purposeful Cloudflare Free Tier', () => {
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

  it('audits only purposeful Cloudflare Free Tier services mapped directly to Gates G0-G7 at 0 VND/month', () => {
    const report = auditCloudflareFreeTierSuite();
    expect(report.totalServicesConfigured).toBe(6);
    expect(report.activeServicesCount).toBe(6);
    expect(report.totalMonthlyCostVnd).toBe(0);
    expect(report.isZeroWasteOptimized).toBe(true);
    expect(report.services.every((s) => s.monthlyCostVnd === 0 && s.targetGate.length > 0)).toBe(true);
  });

  it('executes KV (Anti-Herd/Marts cache), R2 (Tier-1 Raw & Gate G6 Vault), Hyperdrive, and Turnstile adapters cleanly', async () => {
    await edgeKvPut(undefined, 'test:kv:key', 'edge_cached_value', 60);
    expect(await edgeKvGet(undefined, 'test:kv:key')).toBe('edge_cached_value');

    const r2Receipt = await edgeR2PutImmutableObject(
      undefined,
      'vault/test-receipt.json',
      '{"crop":"CAI_THIA"}',
      'sha256_abc'
    );
    expect(r2Receipt.key).toBe('vault/test-receipt.json');
    expect(await edgeR2GetObject(undefined, 'vault/test-receipt.json')).toBe('{"crop":"CAI_THIA"}');

    const hdBound = resolveWarehouseConnectionString({
      HYPERDRIVE: { connectionString: 'postgresql://localhost:5432/neondb' },
    });
    expect(hdBound.viaHyperdrive).toBe(true);

    const turnstileOk = await verifyTurnstileToken(undefined, 'valid_token');
    expect(turnstileOk.verified).toBe(true);

    const turnstileBot = await verifyTurnstileToken(undefined, 'INVALID_BOT_TOKEN');
    expect(turnstileBot.verified).toBe(false);
  });
});
