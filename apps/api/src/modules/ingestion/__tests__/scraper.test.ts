import { describe, it, expect } from 'vitest';
import { calculateSha256, hashFarmerPhonePii } from '../../../core/crypto/hash.js';
import { parseWholesaleMarketReport } from '../application/market-scraper.js';

describe('Module 1 [ingestion]: Scraper & Cryptographic PII Hash Test', () => {
  it('generates consistent 64-char SHA-256 hash for raw payload', async () => {
    const hash1 = await calculateSha256('gia_nong_san_binh_dien_2026-10-28');
    const hash2 = await calculateSha256('gia_nong_san_binh_dien_2026-10-28');
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('irreversibly hashes farmer phone with PII_HASH_SALT (Decree 13/2023/ND-CP)', async () => {
    const salt = 'agridata_secure_dev_pii_salt_2026_x3_compliant_secret';
    const digest1 = await hashFarmerPhonePii('0912345678', salt);
    const digest2 = await hashFarmerPhonePii('0912-345-678', salt);
    expect(digest1).toBe(digest2);
    expect(digest1).toHaveLength(64);
    await expect(hashFarmerPhonePii('0912345678', 'short')).rejects.toThrow('PII_HASH_SALT');
  });

  it('parses wholesale market report and converts units to VND/kg', async () => {
    const rawReport = 'Bản tin giá ngày 28/10/2026: Cải thìa 1,200,000 đ/tạ, Dưa leo 28,000 đ/chục';
    const result = await parseWholesaleMarketReport('binh_dien', rawReport, '2026-10-28');

    expect(result.rawRecord.sourceName).toBe('cho_binh_dien');
    expect(result.items.length).toBe(4);

    const bokChoy = result.items.find((i) => i.cropCode === 'bok_choy');
    expect(bokChoy).toBeDefined();
    expect(bokChoy?.priceVndPerKg).toBe(12000);
  });
});
