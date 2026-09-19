#!/usr/bin/env bash
# Per-boot startup: bring up PostgreSQL so the backend can connect.
# Must be idempotent and tolerant of an already-running cluster.
set -euo pipefail

PG_VERSION="$(pg_lsclusters -h 2>/dev/null | awk 'NR==1{print $1}')"
PG_VERSION="${PG_VERSION:-16}"

if ! pg_lsclusters -h 2>/dev/null | awk '{print $4}' | grep -q online; then
  echo "[start] Starting PostgreSQL cluster ${PG_VERSION}/main..."
  sudo pg_ctlcluster "${PG_VERSION}" main start || true
fi

for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    echo "[start] PostgreSQL is ready."
    exit 0
  fi
  sleep 1
done

echo "[start] WARNING: PostgreSQL did not report ready within timeout." >&2
exit 0
