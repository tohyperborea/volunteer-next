#!/bin/sh
set -e

# Load Docker Secret into environment if it exists
SECRET_FILE="/run/secrets/env_production"

if [ -f "$SECRET_FILE" ]; then
  echo "Loading environment from Docker Secret..."
  # Export each non-comment, non-empty line as an env var
  set -a
  . "$SECRET_FILE"
  set +a
else
  echo "Warning: Secret file not found at $SECRET_FILE"
fi

exec "$@"