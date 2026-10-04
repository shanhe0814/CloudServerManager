#!/usr/bin/env bash
# Idempotent bootstrap for the CloudServerManager dev environment.
# Runs after the repository is checked out. Safe to run multiple times.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"

PG_USER="cloudserve"
PG_PASSWORD="cloudserve_dev"
PG_DB="cloudserve"
DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@localhost:5432/${PG_DB}"

echo "[install] Installing PostgreSQL (if missing)..."
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  sudo apt-get update
  sudo apt-get install -y postgresql postgresql-contrib
fi

PG_VERSION="$(pg_lsclusters -h 2>/dev/null | awk 'NR==1{print $1}')"
PG_VERSION="${PG_VERSION:-16}"

echo "[install] Ensuring PostgreSQL cluster ${PG_VERSION}/main is running..."
if ! pg_lsclusters -h 2>/dev/null | awk '{print $4}' | grep -q online; then
  sudo pg_ctlcluster "${PG_VERSION}" main start || true
fi

# Wait for the server to accept connections.
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then break; fi
  sleep 1
done

echo "[install] Ensuring database role and database exist..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${PG_USER}') THEN
    CREATE ROLE ${PG_USER} LOGIN PASSWORD '${PG_PASSWORD}';
  END IF;
END
\$\$;
SQL
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${PG_DB}'" | grep -q 1; then
  sudo -u postgres createdb -O "${PG_USER}" "${PG_DB}"
fi
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE ${PG_DB} TO ${PG_USER};"

echo "[install] Writing backend/.env (if missing)..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
  cat > "$BACKEND_DIR/.env" <<ENV
# Local development environment (gitignored). Regenerate by deleting this file.
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
PORT=3000
NODE_ENV=development
ENV
fi

echo "[install] Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install

echo "[install] Generating Prisma client and syncing schema..."
npx prisma generate
npx prisma db push --skip-generate

echo "[install] Seeding plan catalog (only when empty)..."
PLAN_COUNT="$(PGPASSWORD=${PG_PASSWORD} psql -h 127.0.0.1 -U ${PG_USER} -d ${PG_DB} -tAc 'SELECT count(*) FROM plan;' 2>/dev/null || echo 0)"
if [ "${PLAN_COUNT:-0}" = "0" ]; then
  npm run db:seed
else
  echo "[install] plan table already has ${PLAN_COUNT} rows; skipping seed."
fi

echo "[install] Done."
