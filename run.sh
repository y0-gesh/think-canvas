#!/usr/bin/env bash
# ─────────────────────────────────────────────
# ThinkCanvas — Start all services
# ─────────────────────────────────────────────
# Usage:  ./run.sh [--skip-redis] [--skip-migrate]
#
# Starts:
#   1. PostgreSQL check
#   2. Prisma migrate (unless --skip-migrate)
#   3. Redis (unless --skip-redis)
#   4. Backend  (Fastify on :3002)
#   5. Frontend (Next.js on :3000)
# ─────────────────────────────────────────────

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/tc-backend"
FRONTEND_DIR="$ROOT_DIR/tc-frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SKIP_REDIS=false
SKIP_MIGRATE=false

# Parse flags
for arg in "$@"; do
  case $arg in
    --skip-redis)   SKIP_REDIS=true ;;
    --skip-migrate) SKIP_MIGRATE=true ;;
    --help|-h)
      echo "Usage: ./run.sh [--skip-redis] [--skip-migrate]"
      echo ""
      echo "  --skip-redis     Don't start Redis"
      echo "  --skip-migrate   Skip Prisma migration check"
      echo ""
      exit 0
      ;;
  esac
done

# Cleanup on exit — kill background processes
cleanup() {
  echo ""
  echo -e "${YELLOW}⏹  Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  kill $REDIS_PID 2>/dev/null || true
  wait 2>/dev/null
  echo -e "${GREEN}✓  All services stopped${NC}"
}
trap cleanup EXIT INT TERM

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════╗"
echo "║         🧠  ThinkCanvas                  ║"
echo "║    Graph-First Node Editor               ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ─── 1. Check prerequisites ───
echo -e "${CYAN}[1/5]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js $(node -v)"

if ! command -v psql &> /dev/null; then
  echo -e "  ${YELLOW}⚠${NC} psql not in PATH (PostgreSQL must be running separately)"
else
  echo -e "  ${GREEN}✓${NC} PostgreSQL client found"
fi

# ─── 2. Install deps if needed ───
echo -e "${CYAN}[2/5]${NC} Checking dependencies..."

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo -e "  Installing backend deps..."
  (cd "$BACKEND_DIR" && npm install)
else
  echo -e "  ${GREEN}✓${NC} Backend deps installed"
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "  Installing frontend deps..."
  (cd "$FRONTEND_DIR" && npm install)
else
  echo -e "  ${GREEN}✓${NC} Frontend deps installed"
fi

# ─── 3. Database migration ───
if [ "$SKIP_MIGRATE" = false ]; then
  echo -e "${CYAN}[3/5]${NC} Running Prisma migration..."
  (cd "$BACKEND_DIR" && npx prisma migrate dev --name auto 2>&1 | tail -3)
  (cd "$BACKEND_DIR" && npx prisma generate 2>&1 | tail -1)
  echo -e "  ${GREEN}✓${NC} Database migrated"
else
  echo -e "${CYAN}[3/5]${NC} Skipping migration (--skip-migrate)"
fi

# ─── 4. Redis (optional) ───
REDIS_PID=""
if [ "$SKIP_REDIS" = false ]; then
  echo -e "${CYAN}[4/5]${NC} Starting Redis..."
  if command -v redis-server &> /dev/null; then
    redis-server --daemonize yes --port 6379 2>/dev/null && \
      echo -e "  ${GREEN}✓${NC} Redis running on :6379" || \
      echo -e "  ${YELLOW}⚠${NC} Redis already running or failed to start"
  else
    echo -e "  ${YELLOW}⚠${NC} redis-server not found — skipping (not required)"
  fi
else
  echo -e "${CYAN}[4/5]${NC} Skipping Redis (--skip-redis)"
fi

# ─── 5. Start services ───
echo -e "${CYAN}[5/5]${NC} Starting services..."

# Backend
echo -e "  Starting backend on :3002..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!
sleep 3

# Frontend
echo -e "  Starting frontend on :3000..."
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!
sleep 3

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ ThinkCanvas is running!${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo -e "  Frontend:  ${CYAN}http://localhost:3000${NC}"
echo -e "  Backend:   ${CYAN}http://localhost:3002${NC}"
echo -e "  Health:    ${CYAN}http://localhost:3002/health${NC}"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for background processes
wait
