-- Full schema for Neon (and any Postgres) when migrations are not run automatically.
-- Run this once in Neon SQL Editor or: psql $POSTGRES_URL -f db/scripts/neon-full-schema.sql
-- Order matches: v2 -> v3 -> v4 -> v5 -> v6 (v1 is test only, skipped).

-- v2: auth tables (Better Auth)
CREATE TABLE IF NOT EXISTS "user" (
  "id" text NOT NULL PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL,
  "image" text,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text NOT NULL PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text NOT NULL PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text NOT NULL PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- v3: uuid extension, enum, event, team, role
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE "role_type" AS ENUM ('admin', 'organiser', 'team-lead');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "event" (
  "id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" text NOT NULL,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "team" (
  "id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" text NOT NULL,
  "eventId" uuid NOT NULL REFERENCES "event" ("id") ON DELETE CASCADE,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "role" (
  "id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "type" "role_type" NOT NULL,
  "eventId" uuid REFERENCES "event" ("id") ON DELETE CASCADE,
  "teamId" uuid REFERENCES "team" ("id") ON DELETE CASCADE,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "role_organiser_check" CHECK (
    ("type" = 'organiser' AND "eventId" IS NOT NULL) OR "type" != 'organiser'
  ),
  CONSTRAINT "role_team_lead_check" CHECK (
    ("type" = 'team-lead' AND "eventId" IS NOT NULL AND "teamId" IS NOT NULL) OR "type" != 'team-lead'
  ),
  CONSTRAINT "role_admin_check" CHECK (
    ("type" = 'admin' AND "eventId" IS NULL AND "teamId" IS NULL) OR "type" != 'admin'
  )
);

-- v4: event dates
ALTER TABLE "event"
  ADD COLUMN IF NOT EXISTS "startDate" date,
  ADD COLUMN IF NOT EXISTS "endDate" date;
UPDATE "event" SET "startDate" = CURRENT_DATE WHERE "startDate" IS NULL;
UPDATE "event" SET "endDate" = CURRENT_DATE WHERE "endDate" IS NULL;
ALTER TABLE "event" ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE "event" ALTER COLUMN "endDate" SET NOT NULL;

-- v5: team slug, description, indexes; event slug
ALTER TABLE "team"
  ADD COLUMN IF NOT EXISTS "slug" text,
  ADD COLUMN IF NOT EXISTS "description" text NOT NULL DEFAULT '';

UPDATE "team" SET "slug" = lower(replace("name", ' ', '-')) WHERE "slug" IS NULL;

ALTER TABLE "team" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_team_slug" ON "team" ("eventId", "slug");
CREATE INDEX IF NOT EXISTS "idx_team_eventId" ON "team" ("eventId");

ALTER TABLE "event" ADD COLUMN IF NOT EXISTS "slug" text;

UPDATE "event" SET "slug" = lower(replace("name", ' ', '-')) WHERE "slug" IS NULL;

ALTER TABLE "event" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_event_slug" ON "event" ("slug");

-- v6: user soft delete
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deletedAt" timestamptz;
