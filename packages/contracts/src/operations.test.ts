import { describe, it, expect } from 'vitest';
import { B2BContractAgreementSchema } from './operations';

describe('Phase 7 Operations & Business Contracts', () => {
  it('validates a signed B2B cooperative subscription agreement', () => {
    const validAgreement = {
      contractId: 'B2B_2026_001',
      clientName: 'Hợp tác xã Nông nghiệp Công nghệ cao An Phú Tân',
      clientType: 'COOPERATIVE' as const,
      tier: 'COOP_STANDARD' as const,
      monthlyFeeVnd: 3500000,
      signedAtIso: '2026-09-01T08:00:00.000Z',
      effectiveFromIso: '2026-09-01',
      effectiveToIso: '2027-09-01',
      status: 'ACTIVE' as const,
      contactPerson: 'Ông Nguyễn Văn Giám Đốc',
    };

    const parsed = B2BContractAgreementSchema.safeParse(validAgreement);
    expect(parsed.success).toBe(true);
  });

  it('rejects contract with negative monthly fee or invalid status', () => {
    const invalid = {
      contractId: 'B2B_ERR',
      clientName: 'Doanh nghiệp X',
      clientType: 'COOPERATIVE',
      tier: 'ENTERPRISE',
      monthlyFeeVnd: -1000,
      signedAtIso: '2026-09-01',
      effectiveFromIso: '2026-09-01',
      effectiveToIso: '2027-09-01',
      status: 'UNKNOWN_STATUS',
      contactPerson: 'Mr A',
    };

    const parsed = B2BContractAgreementSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
