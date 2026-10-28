import { describe, it, expect } from 'vitest';
import { FieldFarmerEnrollmentSchema } from './field-experiment';

describe('Phase 6 Field Experiment Contracts', () => {
  it('validates pilot farmer enrollment record', () => {
    const valid = {
      farmerId: 'PILOT_01',
      coopId: 'COOP_AN_PHU_TAN',
      name: 'Chú Năm Rau',
      cohort: 'PILOT' as const,
      agreementSigned: true,
      signedAtIso: '2026-06-01T08:00:00.000Z',
      baselineHistoricalProfitVnd: 12000000,
      baselineLossRatePct: 25.0,
      wantsToContinueNextSeason: true,
    };
    const parsed = FieldFarmerEnrollmentSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid cohort or out of bound loss rate', () => {
    const invalid = {
      farmerId: 'ERR_01',
      coopId: 'COOP_01',
      name: 'Test',
      cohort: 'UNKNOWN',
      agreementSigned: false,
      signedAtIso: '2026-06-01',
      baselineHistoricalProfitVnd: 0,
      baselineLossRatePct: 150, // > 100
    };
    const parsed = FieldFarmerEnrollmentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
