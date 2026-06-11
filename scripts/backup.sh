#!/usr/bin/env bash
# Nightly Postgres backup. Keeps 14 days of gzipped dumps.
#
# Cron (on the VPS host):
#   0 3 * * * /opt/preplyfly/scripts/backup.sh >> /var/log/preplyfly-backup.log 2>&1
#
# Restore:
#   gunzip -c /backups/preplyfly-YYYY-MM-DD.sql.gz | \
#     docker exec -i <postgres-container> psql -U app -d academic
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
PG_CONTAINER="${PG_CONTAINER:-$(docker ps --format '{{.Names}}' | grep -m1 postgres)}"
DB_USER="${POSTGRES_USER:-app}"
DB_NAME="${POSTGRES_DB:-academic}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%F)"
OUT="$BACKUP_DIR/preplyfly-$STAMP.sql.gz"

docker exec "$PG_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$OUT"

# Sanity: a real dump is never tiny.
if [ "$(stat -c%s "$OUT")" -lt 10000 ]; then
  echo "ERROR: backup suspiciously small: $OUT" >&2
  exit 1
fi

find "$BACKUP_DIR" -name 'preplyfly-*.sql.gz' -mtime "+$KEEP_DAYS" -delete
echo "OK: $OUT ($(du -h "$OUT" | cut -f1))"
