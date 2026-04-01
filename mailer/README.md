# volunteer-next/mailer

A simple mail service for delivering email from a database queue.

## Environment

The service requires the following environment variables:

| Variable          | Description                                         | Default                          |
| ----------------- | --------------------------------------------------- | -------------------------------- |
| CRON_SCHEDULE     | Mailer schedule in crontab syntax                   | 0 0 \* \* \*                     |
| RATE_LIMIT        | Max number of mails to process per tick             | 100                              |
| POSTGRES_HOST     | Postgres host for the mail queue                    | localhost                        |
| POSTGRES_USER     | Postgres user for the mail queue                    | postgres                         |
| POSTGRES_PASSWORD | Postgres password for the mail queue                | example                          |
| POSTGRES_DB       | Postgres database for the mail queue                | postgres                         |
| POSTGRES_PORT     | Postgres port for the mail queue                    | 5432                             |
| SMTP_HOST         | Host for the SMTP mailserver                        | smtp.example.com                 |
| SMTP_USER         | User for the SMTP mailserver                        | smtp_user                        |
| SMTP_PASSWORD     | Password for the SMTP mailserver                    | smtp_password                    |
| SMTP_PORT         | Port for the SMTP mailserver                        | 587                              |
| SMTP_SECURE       | Set to 'true' if using SMTP port 465                | false                            |
| SMTP_FROM         | Address to send mail from                           | SMTP_USER \|\| noreply@localhost |
| FAKE_SEND         | Debug flag to log instead of actually sending email | false                            |
