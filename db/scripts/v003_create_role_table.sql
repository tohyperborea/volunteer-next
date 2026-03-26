create extension if not exists "uuid-ossp";

create type "role_type" as enum ('admin', 'organiser', 'team-lead');

-- We can add more columns to event later as needed
create table "event" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "name" text not null,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

-- We can add more columns to team later as needed
create table "team" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "name" text not null,
    "eventId" uuid not null references "event" ("id") on delete cascade,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create table "role" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "userId" text not null references "user" ("id") on delete cascade,
    "type" "role_type" not null,
    "eventId" uuid references "event" ("id") on delete cascade,
    "teamId" uuid references "team" ("id") on delete cascade,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null,

    constraint "role_organiser_check" check (
        ("type" = 'organiser' and "eventId" is not null) or "type" != 'organiser'
    ),
    constraint "role_team_lead_check" check (
        ("type" = 'team-lead' and "eventId" is not null and "teamId" is not null) or "type" != 'team-lead'
    ),
    constraint "role_admin_check" check (
        ("type" = 'admin' and "eventId" is null and "teamId" is null) or "type" != 'admin'
    )
);
