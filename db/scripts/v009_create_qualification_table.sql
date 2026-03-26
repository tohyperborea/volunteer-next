create table "qualification" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "eventId" uuid not null references "event" ("id") on delete cascade,
    "teamId" uuid references "team" ("id") on delete cascade,
    "name" text not null,
    "errorMessage" text not null,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);
