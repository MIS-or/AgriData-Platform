import { Hono } from 'hono';
import { globalB2BManager } from '../domain/b2b-manager.js';
import { evaluateDataDrift } from '../domain/retraining-pipeline.js';
import { evaluateGateG7 } from '../application/gate-g7-evaluator.js';
import { auditCloudflareFreeTierSuite } from '../../../core/cloudflare/edge-services.js';
import { Env } from '../../../core/config/env.js';

export const operationsRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/ops/b2b/contracts
operationsRouter.get('/b2b/contracts', (c) => {
  const contracts = globalB2BManager.getContracts();
  const mrrVnd = globalB2BManager.calculateMonthlyRecurringRevenueVnd();
  return c.json({
    success: true,
    count: contracts.length,
    monthlyRecurringRevenueVnd: mrrVnd,
    contracts,
  });
});

// POST /api/v1/ops/models/drift-check
operationsRouter.post('/models/drift-check', async (c) => {
  try {
    const body = await c.req.json();
    const { featureName, baselineDistribution, currentDistribution } = body;
    const metrics = evaluateDataDrift(
      featureName || 'wholesale_price_distribution',
      baselineDistribution || [0.2, 0.3, 0.3, 0.2],
      currentDistribution || [0.18, 0.32, 0.29, 0.21]
    );
    return c.json({ success: true, metrics });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// GET /api/v1/ops/infrastructure-cost
operationsRouter.get('/infrastructure-cost', (c) => {
  const audit = globalB2BManager.auditInfrastructureCost('2026-10');
  const cloudflareSuite = auditCloudflareFreeTierSuite(c.env);
  return c.json({
    success: true,
    audit,
    cloudflareSuite,
  });
});

// GET /api/v1/ops/cloudflare-free-tier
operationsRouter.get('/cloudflare-free-tier', (c) => {
  const report = auditCloudflareFreeTierSuite(c.env);
  return c.json({
    success: true,
    ...report,
  });
});

// GET /api/v1/ops/gate-g7-audit
operationsRouter.get('/gate-g7-audit', (c) => {
  const audit = evaluateGateG7(globalB2BManager);
  return c.json({
    gate: 'G7',
    ...audit,
  });
});
