#!/bin/sh
# Run Liquibase migrations against a remote Postgres (e.g. Neon).
# Requires POSTGRES_URL in .env.local (or exported).
# Usage: ./db/migrate-neon.sh   or   npm run migrate:neon

set -e

# Load .env.local if present
if [ -f .env.local ]; then
  set -a
  . ./.env.local
  set +a
fi

if [ -z "$POSTGRES_URL" ]; then
  echo "Error: POSTGRES_URL is not set. Add it to .env.local or export it." >&2
  exit 1
fi

# Convert postgresql:// or postgres:// to jdbc:postgresql://
JDBC_URL=$(echo "$POSTGRES_URL" | sed 's|^postgresql://|jdbc:postgresql://|;s|^postgres://|jdbc:postgresql://|')
if [ "$JDBC_URL" = "$POSTGRES_URL" ]; then
  echo "Error: POSTGRES_URL must start with postgresql:// or postgres://" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
docker compose run --rm --no-deps liquibase \
  --classpath=/liquibase/lib/postgresql.jar \
  --url="$JDBC_URL" \
  --changeLogFile=changelog.xml \
  update
