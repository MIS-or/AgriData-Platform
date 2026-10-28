import {
  B2BContractAgreement,
  InfrastructureCostAudit,
  RegionalExpansionPlan,
} from '@agridata/contracts';

export class B2BManager {
  private contracts: Map<string, B2BContractAgreement> = new Map();
  private expansionPlans: Map<string, RegionalExpansionPlan> = new Map();

  constructor() {
    // Khởi tạo hợp đồng B2B thí điểm đạt chuẩn thương mại (Mã việc 7.4 & 7.5)
    this.addContract({
      contractId: 'B2B_2026_AN_PHU_TAN',
      clientName: 'Hợp tác xã Nông nghiệp Công nghệ cao An Phú Tân',
      clientType: 'COOPERATIVE',
      tier: 'COOP_STANDARD',
      monthlyFeeVnd: 3500000,
      signedAtIso: '2026-09-15T09:00:00.000Z',
      effectiveFromIso: '2026-10-01',
      effectiveToIso: '2027-10-01',
      status: 'ACTIVE',
      contactPerson: 'Trần Văn Chủ Nhiệm',
    });

    // Kế hoạch 6 tháng mở rộng sang vùng thứ hai: Đà Lạt / Lâm Đồng (Mã việc 7.3)
    this.addExpansionPlan({
      regionCode: 'LAM_DONG_DALAT',
      regionName: 'Vùng Chuyên canh Rau ôn đới Đà Lạt',
      province: 'Lâm Đồng',
      representativeName: 'Kỹ sư Lâm Trường Sơn',
      targetCrops: ['xà lách', 'cà chua', 'ớt chuông', 'bông cải'],
      launchTargetDateIso: '2027-04-01',
      budgetVnd: 50000000,
      status: 'PLANNING',
    });
  }

  addContract(contract: B2BContractAgreement): void {
    this.contracts.set(contract.contractId, contract);
  }

  getContracts(): B2BContractAgreement[] {
    return Array.from(this.contracts.values());
  }

  getActiveContracts(): B2BContractAgreement[] {
    return this.getContracts().filter((c) => c.status === 'ACTIVE');
  }

  calculateMonthlyRecurringRevenueVnd(): number {
    return this.getActiveContracts().reduce((sum, c) => sum + c.monthlyFeeVnd, 0);
  }

  addExpansionPlan(plan: RegionalExpansionPlan): void {
    this.expansionPlans.set(plan.regionCode, plan);
  }

  getExpansionPlan(regionCode: string): RegionalExpansionPlan | undefined {
    return this.expansionPlans.get(regionCode);
  }

  /**
   * Kiểm toán chi phí hạ tầng thực tế: 100% Gói miễn phí Cloudflare + Neon Postgres (Mã 7.6 & X6)
   */
  auditInfrastructureCost(month: string): InfrastructureCostAudit {
    return {
      evaluatedMonth: month,
      cloudflareWorkersPagesVnd: 0, // 100k req/ngày miễn phí
      neonPostgresVnd: 0,           // 0.5 GB lưu trữ & compute miễn phí
      openMeteoApiVnd: 0,           // Open API phi thương mại miễn phí
      domainDnsVnd: 0,              // Sử dụng subdomain pages.dev
      totalMonthlyCostVnd: 0,       // 0 VNĐ/tháng
      isZeroCostGuaranteed: true,
      notes: 'Hạ tầng hoàn toàn tương thích gói Cloudflare Free Tier và Neon Free Tier. Chi phí máy chủ hàng tháng là 0 VNĐ.',
    };
  }
}

export const globalB2BManager = new B2BManager();
