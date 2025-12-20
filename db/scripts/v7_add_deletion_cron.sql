CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'remove_deleted_users',
    -- schedule: every day at midnight
    '0 0 * * *',
    $$
    DELETE FROM "user"
    WHERE "deletedAt" IS NOT NULL
      AND "deletedAt" < now() - interval '30 days';
    $$
);
