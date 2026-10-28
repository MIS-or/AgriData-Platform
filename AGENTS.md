# AGENTS.md

Operating Contract for Every AI Coding Agent in AgriData-Platform.

## 1. Bootstrap Order
Before executing any non-trivial change, read in this exact order:
1. `AGENTS.md`
2. `context/project-overview.md`
3. `context/architecture.md`
4. `context/data-governance.md`
5. `context/ai-workflow-rules.md`
6. `context/code-standards.md`
7. `context/progress-tracker.md`
8. `context/ui-context.md`
9. Target source files, migrations, contracts, and test files.

## 2. Source-of-Truth Precedence
1. Explicit user requirement.
2. Agricultural plan invariants (`docs/Kế hoạch dự án nền tảng dữ liệu và đề xuất trồng trọt.md`) and Gate criteria (G0 -> G7).
3. Data privacy & farmers' PII protection (Decree 13/2023/ND-CP).
4. `AGENTS.md` and canonical context files in `context/`.
5. Existing code, database schemas, and passing test suites.
6. Cloudflare Free Tier constraints (10ms CPU/req, 128MB RAM, 100k req/day, 5GB D1, 0.5GB Neon Postgres).
7. Agent preference.

## 3. Architecture & Cloudflare Free Tier Topology
- **System Architecture**: Modular Monolith optimized for Cloudflare Edge.
- **Frontend App (`apps/web`)**: Vite + React 19 + TypeScript + PWA + TailwindCSS.
  - Hosted on **Cloudflare Pages** (Unlimited bandwidth, 500 builds/mo on Free Tier).
  - Dual interfaces: 
    * *Analytics Dashboard* (desktop/tablet for experts & cooperatives).
    * *Farmer PWA* (lightweight, high-contrast, offline-first for rural mobile devices).
- **Edge API & Rule Engine (`apps/api`)**: Cloudflare Workers (Hono framework).
  - Hosted on **Cloudflare Workers** (100k requests/day free).
  - Handles authentication, price queries, rule engine calculations, ingestion webhooks, and cron triggers.
- **Data Warehouse (3-tier)**:
  - **Tier 1 (Raw)**, **Tier 2 (Clean)**, **Tier 3 (Aggregated/Marts)** implemented on **Neon Serverless PostgreSQL** via `@neondatabase/serverless` (HTTP/WebSocket connection pooling).
  - Edge Cache & Fast Lookup on **Cloudflare D1 / KV** (5M reads/day free).
- **Scheduled Workers (Scraper/Crawler)**:
  - Cloudflare Cron Triggers (`0 4 * * *` daily wholesale market fetch) + fallback batch ingestion scripts.
- **Forbidden Inventions**:
  - Do not introduce Kafka, Kubernetes, Elasticsearch, heavyweight microservices, or external paid APIs without explicit user consent.

## 4. Jev Routing Rule (Agri-Platform Skill Router)
Before implementing any task, classify:
- **Phase & Gate Impact**: Belongs to Gate G0, G1, G2, G3, G4, G5, G6, G7, or Cross-cutting X1-X6?
- **Data Risk**: Does it modify raw immutable data? (Forbidden: never overwrite raw tables).
- **Model Risk**: Does it output price predictions? (Must have passed Gate G3 backtesting; otherwise fallback to cost-of-production and supply alerts).
- **Farmer UX Risk**: Does the recommendation cause herd behavior? (Must pass Anti-Herd allocation algorithm).
- **Cloudflare Free Tier Budget**: Does execution stay within 10ms CPU limit and 128MB memory?

### Minimum Useful Skill Set
| Task Type | Sequence |
|---|---|
| Pipeline & Data Quality | `Jev -> Caveman -> Database Design & Optimization -> TDD` |
| Edge API & Contracts | `Jev -> API Design & Contracts -> TDD` |
| Recommendation Engine | `Jev -> Fast & Slow Thinking (Slow) -> TDD -> QA Testing` |
| Farmer UI & Zalo Microcopy | `Jev -> UI/UX Pro Max -> Humanizer -> Web Quality` |
| Gate Audit & Verification | `Jev -> QA Testing (7-Layer Test + 4-Verdict Protocol)` |

## 5. Task Workflow
`UNDERSTAND -> INSPECT -> ROUTE -> PLAN -> IMPLEMENT -> VALIDATE -> REVIEW DIFF -> UPDATE CONTEXT`

## 6. Git Branching & Conventional Commits
- Always branch directly from latest `main`: `git checkout main && git pull origin main && git checkout -b <type>/<scope>`.
- Commit format: `<type>(<scope>): <short description>`.
  Types: `feat`, `fix`, `test`, `data`, `model`, `refactor`, `docs`, `chore`.
- Definition of Done (DoD): Code passes TypeScript check, passes 7-layer tests, conforms to Cloudflare Free Tier, and updates `context/progress-tracker.md`.
