#!/bin/sh
# Run Liquibase migrations against a remote Postgres (e.g. Neon).
# Requires POSTGRES_URL in .env.local (or exported).
# Usage: ./db/migrate-neon.sh [update|changelogSync]
#   update (default) - run pending migrations
#   changelogSync - mark all changesets as run without executing (use when schema already exists)

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

# Parse POSTGRES_URL and build JDBC URL with user/password as separate params.
# The JDBC driver can fail to parse URLs with embedded credentials; passing
# --username and --password separately avoids that (Neon docs recommend this).
eval "$(node -e "
const u = process.env.POSTGRES_URL;
if (!u || (!u.startsWith('postgresql://') && !u.startsWith('postgres://'))) {
  console.error('Error: POSTGRES_URL must start with postgresql:// or postgres://');
  process.exit(1);
}
const url = new URL(u.replace(/^postgres:\/\//, 'postgresql://'));
const host = url.hostname;
const port = url.port || '5432';
const db = url.pathname.slice(1).split('?')[0] || 'postgres';
const params = new URLSearchParams(url.search);
if (!params.has('sslmode')) params.set('sslmode', 'require');
const jdbcUrl = 'jdbc:postgresql://' + host + ':' + port + '/' + db + '?' + params.toString();
console.log('JDBC_URL=' + JSON.stringify(jdbcUrl));
console.log('DB_USER=' + JSON.stringify(decodeURIComponent(url.username || 'postgres')));
console.log('DB_PASS=' + JSON.stringify(decodeURIComponent(url.password || '')));
")"

CMD="${1:-update}"
cd "$(dirname "$0")/.."
docker compose run --rm --no-deps liquibase \
  --classpath=/liquibase/lib/postgresql.jar \
  --url="$JDBC_URL" \
  --username="$DB_USER" \
  --password="$DB_PASS" \
  --changeLogFile=changelog.xml \
  "$CMD"
