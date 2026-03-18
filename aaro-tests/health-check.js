#!/usr/bin/env node
/**
 * AARO Health Check — quick API sanity check (no Playwright needed)
 * Usage: node health-check.js [base-url]
 */

const BASE = process.argv[2] || process.env.API_URL || "http://localhost:5000";

const checks = [
  { name: "Health endpoint", path: "/health" },
  { name: "Ping endpoint", path: "/ping" },
  { name: "Products API", path: "/api/products" },
  { name: "Categories API", path: "/api/categories" },
  { name: "Brands API", path: "/api/brands" },
  { name: "Banners API", path: "/api/banners" },
  { name: "Offers API", path: "/api/offers" },
  { name: "Contact Settings API", path: "/api/contact-settings" },
];

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

async function runChecks() {
  console.log(`\n${BOLD}🏥 AARO Health Check${RESET}`);
  console.log(`   Target: ${BASE}\n`);

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const url = `${BASE}${check.path}`;
    try {
      const start = Date.now();
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const ms = Date.now() - start;
      const color = res.ok ? GREEN : RED;
      const icon = res.ok ? "✓" : "✗";

      console.log(
        `  ${color}${icon}${RESET} ${check.name.padEnd(25)} ${res.status} ${YELLOW}(${ms}ms)${RESET}`
      );

      if (res.ok) passed++;
      else failed++;
    } catch (err) {
      console.log(
        `  ${RED}✗${RESET} ${check.name.padEnd(25)} ${RED}UNREACHABLE${RESET} — ${err.message}`
      );
      failed++;
    }
  }

  console.log(
    `\n  ${BOLD}Results:${RESET} ${GREEN}${passed} passed${RESET}, ${failed > 0 ? RED : GREEN}${failed} failed${RESET}\n`
  );

  process.exit(failed > 0 ? 1 : 0);
}

runChecks();
