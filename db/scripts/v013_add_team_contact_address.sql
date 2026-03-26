-- Add the column
ALTER TABLE team
ADD COLUMN "contactAddress" text;

-- Backfill existing teams with empty string to satisfy NOT NULL constraint
UPDATE team
SET "contactAddress" = 'test@example.com'
WHERE "contactAddress" IS NULL;

-- Enforce NOT NULL constraint
ALTER TABLE team
ALTER COLUMN "contactAddress" SET NOT NULL;
