alter table "team"
add column "slug" text,
add column "description" text not null default '';

update "team"
set "slug" = lower(replace("name", ' ', '-'));

alter table "team"
alter column "slug" set not null;

create unique index "idx_team_slug" on "team" ("eventId", "slug");
create index "idx_team_eventId" on "team" ("eventId");

alter table "event"
add column "slug" text;

update "event"
set "slug" = lower(replace("name", ' ', '-'));

alter table "event"
alter column "slug" set not null;

create unique index "idx_event_slug" on "event" ("slug");