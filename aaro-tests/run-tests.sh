#!/bin/bash
# ─────────────────────────────────────────────
# AARO Test Runner — master script
# Usage: ./run-tests.sh [--fast|--api|--admin|--mobile|--all|--headed]
# ─────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

MODE="${1:---all}"

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║       AARO E2E Test Runner           ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Health check first
echo -e "${YELLOW}▸ Running health check...${NC}"
node health-check.js || {
  echo -e "${RED}✗ Health check failed. Is the server running?${NC}"
  exit 1
}

echo ""
echo -e "${YELLOW}▸ Running tests in mode: ${BOLD}${MODE}${NC}"
echo ""

case "$MODE" in
  --fast)
    npx playwright test --project=chromium \
      tests/e2e/01-homepage.spec.ts \
      tests/e2e/02-shop-pages.spec.ts
    ;;
  --api)
    npx playwright test tests/api/
    ;;
  --admin)
    npx playwright test --project=chromium \
      tests/e2e/04-admin-products.spec.ts \
      tests/e2e/05-admin-tabs.spec.ts
    ;;
  --mobile)
    npx playwright test \
      --project='Pixel 5' \
      --project='iPhone 13' \
      --project='Galaxy S21' \
      tests/e2e/08-responsive.spec.ts
    ;;
  --headed)
    npx playwright test --headed --project=chromium
    ;;
  --all)
    npx playwright test
    ;;
  *)
    echo -e "${RED}Unknown mode: $MODE${NC}"
    echo "Usage: ./run-tests.sh [--fast|--api|--admin|--mobile|--all|--headed]"
    exit 1
    ;;
esac

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ All tests passed!${NC}"
else
  echo -e "${RED}${BOLD}✗ Some tests failed. Check the report:${NC}"
  echo -e "  npx playwright show-report"
fi

exit $EXIT_CODE
