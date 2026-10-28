#!/usr/bin/env node
/**
 * AgriData Platform - Automated Architecture Boundary & Secret Isolation Audit
 * Enforces:
 * 1. Single Root `.env` & `.env.example` Policy (Zero `.env*` or `.dev.vars*` in subdirectories).
 * 2. Git Secret Protection (`.env` is git-ignored; zero secret files tracked in Git).
 * 3. Zero Leaked Credentials in Codebase (Scans all tracked files for hardcoded secrets/keys).
 * 4. Strict Modular Monolith Boundaries (No deep imports across `modules/*` internal layers).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const errors = [];

function walkFiles(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === '.wrangler' ||
      entry.name === 'coverage'
    ) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, result);
    } else {
      result.push(fullPath);
    }
  }
  return result;
}

// --------------------------------------------------------------------
// 1. Verify Single Root .env & .env.example Policy
// --------------------------------------------------------------------
if (!fs.existsSync(path.join(ROOT_DIR, '.env.example'))) {
  errors.push('[ENV POLICY] Missing root `.env.example` template file.');
}

const allRepoFiles = walkFiles(ROOT_DIR);
for (const file of allRepoFiles) {
  const rel = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
  const base = path.basename(rel);

  if (base.startsWith('.env') || base.startsWith('.dev.vars')) {
    if (rel !== '.env' && rel !== '.env.example') {
      errors.push(
        `[SINGLE .ENV VIOLATION] Forbidden env file found outside root: "${rel}". Only root "/.env" and "/.env.example" are permitted.`
      );
    }
  }
}

// --------------------------------------------------------------------
// 2. Verify Git Ignore & Tracked Files Security (with Docker .git-less fallback)
// --------------------------------------------------------------------
try {
  const hasGitDir = fs.existsSync(path.join(ROOT_DIR, '.git'));
  const trackedFiles = hasGitDir
    ? execSync('git ls-files', { encoding: 'utf8' })
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : allRepoFiles
        .map((f) => path.relative(ROOT_DIR, f).replace(/\\/g, '/'))
        .filter((rel) => rel !== '.env');

  for (const tracked of trackedFiles) {
    const base = path.basename(tracked);
    if (
      (base.startsWith('.env') && tracked !== '.env.example') ||
      base.startsWith('.dev.vars') ||
      base.endsWith('.pem') ||
      base.endsWith('.key') ||
      base.endsWith('.p12')
    ) {
      errors.push(`[GIT SECRET LEAK] Sensitive file "${tracked}" is tracked by Git!`);
    }
  }

  // Scan tracked source files for hardcoded secrets or private keys
  const secretPatterns = [
    { name: 'Private Key Header', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
    { name: 'GitHub PAT Token', regex: /\bghp_[A-Za-z0-9]{36}\b/ },
    { name: 'Slack Token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
    {
      name: 'Frontend VITE_ Secret Exposure',
      regex: /^\s*VITE_[A-Z0-9_]*(SECRET|PASSWORD|PRIVATE|DATABASE_URL|SALT)[A-Z0-9_]*\s*=/m,
    },
  ];

  for (const tracked of trackedFiles) {
    if (tracked === 'scripts/verify-architecture.mjs') continue;
    const fullPath = path.join(ROOT_DIR, tracked);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) continue;

    const ext = path.extname(tracked).toLowerCase();
    if (!['.ts', '.tsx', '.js', '.mjs', '.json', '.jsonc', '.sql', '.yml', '.yaml', '.example'].includes(ext) && tracked !== '.env.example') {
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    for (const pat of secretPatterns) {
      if (pat.regex.test(content)) {
        errors.push(`[SECRET LEAK DETECTED] ${pat.name} found in tracked file "${tracked}".`);
      }
    }

    // Check for real Postgres connection strings outside .env.example
    if (tracked !== '.env.example' && !tracked.endsWith('.md')) {
      const pgMatches = content.match(/postgres(?:ql)?:\/\/[^\s"']+/g) || [];
      for (const match of pgMatches) {
        if (!match.includes('ep-sample-123456') && !match.includes('postgres-warehouse') && !match.includes('localhost')) {
          errors.push(`[HARDCODED DB URL] Non-placeholder Postgres URL found in "${tracked}".`);
        }
      }
    }
  }
} catch (err) {
  errors.push(`[GIT AUDIT ERROR] Could not verify git tracked files: ${err.message}`);
}

// --------------------------------------------------------------------
// 3. Verify Modular Monolith Boundaries (`apps/api/src/modules/*` & `apps/web/src/modules/*`)
// --------------------------------------------------------------------
const apiModulesDir = path.join(ROOT_DIR, 'apps/api/src/modules');
const requiredApiModules = [
  'ingestion',
  'data-quality',
  'market-intelligence',
  'farmer-advisory',
  'field-experiment',
  'platform-ops',
];

for (const modName of requiredApiModules) {
  const modDir = path.join(apiModulesDir, modName);
  const facadeFile = path.join(modDir, 'index.ts');
  const testsDir = path.join(modDir, '__tests__');

  if (!fs.existsSync(facadeFile)) {
    errors.push(`[MODULE BOUNDARY] Backend module "${modName}" is missing its Public Facade (index.ts).`);
  }
  if (!fs.existsSync(testsDir)) {
    errors.push(`[MODULE BOUNDARY] Backend module "${modName}" is missing its isolated "__tests__" directory.`);
  }
}

function checkModuleBoundaries(modulesRootDir, appLabel) {
  if (!fs.existsSync(modulesRootDir)) return;
  const moduleNames = fs
    .readdirSync(modulesRootDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const currentMod of moduleNames) {
    const currentModDir = path.join(modulesRootDir, currentMod);
    const files = walkFiles(currentModDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

    for (const file of files) {
      const relFile = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
      const content = fs.readFileSync(file, 'utf8');
      const importRegex = /from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importSpec = match[1];
        for (const otherMod of moduleNames) {
          if (otherMod === currentMod) continue;

          // Disallow any import reaching into another module's internal folders (domain, application, api, __tests__)
          const deepImportPattern = new RegExp(`modules/${otherMod}/(domain|application|api|__tests__)|\\.\\./${otherMod}/(domain|application|api|__tests__)`);
          if (deepImportPattern.test(importSpec)) {
            errors.push(
              `[BOUNDARY VIOLATION] (${appLabel}) "${relFile}" in module "${currentMod}" deeply imports internal layer of module "${otherMod}" ("${importSpec}"). Use @agridata/contracts or module Public Facade index.ts instead.`
            );
          }

          // Even cross-module imports in backend domain/application should be completely decoupled
          const anyCrossModulePattern = new RegExp(`(\\.\\./)+${otherMod}(/|$)`);
          if (anyCrossModulePattern.test(importSpec)) {
            errors.push(
              `[COUPLED MODULES] (${appLabel}) "${relFile}" directly imports sibling module "${otherMod}" ("${importSpec}"). Modules must remain independent.`
            );
          }
        }
      }
    }
  }
}

checkModuleBoundaries(apiModulesDir, 'apps/api');
checkModuleBoundaries(path.join(ROOT_DIR, 'apps/web/src/modules'), 'apps/web');

if (errors.length > 0) {
  console.error('\n❌ ARCHITECTURE & SECRET ISOLATION AUDIT FAILED:');
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log('✅ Architecture & Secret Isolation Audit Passed:');
  console.log('   - Single root .env & .env.example policy verified (0 sub-env files)');
  console.log('   - 0 secrets or private keys exposed in Git tracked files');
  console.log(`   - ${requiredApiModules.length} independent backend Bounded Contexts verified with zero cross-module coupling`);
}
