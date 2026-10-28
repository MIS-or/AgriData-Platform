import { describe, it, expect } from 'vitest';
import {
  aggregateCleanPricesToMarts,
  getYearWeekString,
  CleanPriceInput,
} from './marts-aggregator.js';

describe('Marts Aggregator & Feature Engineering Test (Mã việc 2.8)', () => {
  it('correctly maps date to standard Year-Week string', () => {
    const { yearWeek } = getYearWeekString('2026-10-28');
    expect(yearWeek).toBe('2026-W43');
  });

  it('aggregates daily prices into weekly metrics and computes lag features', () => {
    const cleanPrices: CleanPriceInput[] = [
      // Tuần 1
      { cropCode: 'bok_choy', regionCode: 'vung_1', date: '2026-10-05', priceVndPerKg: 10000 },
      { cropCode: 'bok_choy', regionCode: 'vung_1', date: '2026-10-07', priceVndPerKg: 12000 },
      // Tuần 2
      { cropCode: 'bok_choy', regionCode: 'vung_1', date: '2026-10-12', priceVndPerKg: 13000 },
      { cropCode: 'bok_choy', regionCode: 'vung_1', date: '2026-10-14', priceVndPerKg: 15000 },
      // Tuần 3
      { cropCode: 'bok_choy', regionCode: 'vung_1', date: '2026-10-19', priceVndPerKg: 14000 },
    ];

    const marts = aggregateCleanPricesToMarts(cleanPrices);

    expect(marts.length).toBe(3);
    // Tuần 1: avg = 11000, min = 10000, max = 12000
    expect(marts[0]?.avgPriceVnd).toBe(11000);
    expect(marts[0]?.lag1wPriceVnd).toBeUndefined();

    // Tuần 2: avg = 14000, lag1w = 11000
    expect(marts[1]?.avgPriceVnd).toBe(14000);
    expect(marts[1]?.lag1wPriceVnd).toBe(11000);

    // Tuần 3: avg = 14000, lag1w = 14000, lag2w = 11000
    expect(marts[2]?.lag1wPriceVnd).toBe(14000);
    expect(marts[2]?.lag2wPriceVnd).toBe(11000);
  });
});
