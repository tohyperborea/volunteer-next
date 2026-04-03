#!/bin/sh
set -e

# Load individual Docker Secrets from /run/secrets/
# Files should be named {ENV_VAR_NAME}_FILE and contain only the secret value
SECRETS_DIR="/run/secrets"

if [ -d "$SECRETS_DIR" ]; then
  for secret_file in "$SECRETS_DIR"/*; do
    # Skip if glob found no matches
    [ -f "$secret_file" ] || continue

    filename=$(basename "$secret_file")
    env_var="${filename}"
    secret_value=$(cat "$secret_file")

    export "$env_var=$secret_value"
    echo "Loaded secret: $env_var"
  done
else
  echo "Warning: Secrets directory not found at $SECRETS_DIR"
fi

exec "$@"
