import { describe, it, expect } from 'vitest';
import { FarmerProfileSchema } from './farmer';
import { LEGAL_DISCLAIMER } from './legal';

describe('Phase 5 Farmer & Legal Contracts', () => {
  it('validates a valid farmer profile', () => {
    const validProfile = {
      farmerId: 'FARMER_001',
      name: 'Nguyễn Văn An',
      phone: '0912345678',
      coopId: 'COOP_AN_PHU_TAN',
      coopName: 'HTX Nông nghiệp An Phú Tân',
      totalAreaM2: 2500,
      availableCapitalVnd: 15000000,
      soilType: 'alluvial' as const,
      experienceYears: 12,
    };
    const parsed = FarmerProfileSchema.safeParse(validProfile);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid soil type or negative area', () => {
    const invalidProfile = {
      farmerId: 'FARMER_002',
      name: 'Trần Văn Bình',
      phone: '0900000000',
      coopId: 'COOP_01',
      coopName: 'HTX Thí điểm',
      totalAreaM2: -100,
      availableCapitalVnd: -500,
      soilType: 'rocky_mountain',
      experienceYears: -1,
    };
    const parsed = FarmerProfileSchema.safeParse(invalidProfile);
    expect(parsed.success).toBe(false);
  });

  it('verifies legal disclaimer compliance with Decree 13/2023/ND-CP', () => {
    expect(LEGAL_DISCLAIMER.version).toBe('2026.1');
    expect(LEGAL_DISCLAIMER.shortDisclaimerText).toContain('tham khảo');
    expect(LEGAL_DISCLAIMER.fullDisclaimerMarkdown).toContain('Nghị định 13/2023/NĐ-CP');
    expect(LEGAL_DISCLAIMER.consentStatement).toContain('tự nguyện chia sẻ số liệu');
  });
});
