# volunteer-next/upload-cleaner

A service for removing unused uploads

## Environment

The service requires the following environment variables:

| Variable          | Description                            | Default      |
| ----------------- | -------------------------------------- | ------------ |
| CRON_SCHEDULE     | Mailer schedule in crontab syntax      | 0 0 \* \* \* |
| POSTGRES_HOST     | Postgres host                          | localhost    |
| POSTGRES_USER     | Postgres user                          | postgres     |
| POSTGRES_PASSWORD | Postgres password                      | example      |
| POSTGRES_DB       | Postgres database                      | postgres     |
| POSTGRES_PORT     | Postgres port                          | 5432         |
| UPLOADS_DIR       | The path to uploaded stuff to clean up | ../uploads   |
